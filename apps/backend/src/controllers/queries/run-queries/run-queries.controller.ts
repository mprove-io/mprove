import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { and, eq, inArray } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import asyncPool from 'tiny-async-pool';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  ConnectionTab,
  QueryTab,
  UserTab
} from '~backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { ConnectionsService } from '~backend/services/db/connections.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MembersService } from '~backend/services/db/members.service';
import { QueriesService } from '~backend/services/db/queries.service';
import { StructsService } from '~backend/services/db/structs.service';
import { BigQueryService } from '~backend/services/dwh/bigquery.service';
import { ClickHouseService } from '~backend/services/dwh/clickhouse.service';
import { DuckDbService } from '~backend/services/dwh/duckdb.service';
import { MysqlService } from '~backend/services/dwh/mysql.service';
import { PgService } from '~backend/services/dwh/pg.service';
import { PrestoService } from '~backend/services/dwh/presto.service';
import { SnowFlakeService } from '~backend/services/dwh/snowflake.service';
import { TrinoService } from '~backend/services/dwh/trino.service';
import { StoreService } from '~backend/services/store.service';
import { TabService } from '~backend/services/tab.service';
import { PROD_REPO_ID, PROJECT_ENV_PROD } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendRunQueriesRequest,
  ToBackendRunQueriesResponsePayload
} from '~common/interfaces/to-backend/queries/to-backend-run-queries';
import { ServerError } from '~common/models/server-error';

let { JWT } = require('google-auth-library');
let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RunQueriesController {
  constructor(
    private tabService: TabService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private queriesService: QueriesService,
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private pgService: PgService,
    private mysqlService: MysqlService,
    private duckdbService: DuckDbService,
    private prestoService: PrestoService,
    private trinoService: TrinoService,
    private storeService: StoreService,
    private clickhouseService: ClickHouseService,
    private bigqueryService: BigQueryService,
    private envsService: EnvsService,
    private snowflakeService: SnowFlakeService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendRunQueries)
  async runQueries(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendRunQueriesRequest = request.body;

    let { projectId, isRepoProd, branchId, envId, mconfigIds, poolSize } =
      reqValid.payload;

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? PROD_REPO_ID : user.userId,
      branchId: branchId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let mconfigs = await this.db.drizzle.query.mconfigsTable.findMany({
      where: and(
        eq(mconfigsTable.structId, bridge.structId),
        inArray(mconfigsTable.mconfigId, mconfigIds)
      )
    });

    let modelIds = [...new Set(mconfigs.map(x => x.modelId))];

    let models = await this.db.drizzle.query.modelsTable
      .findMany({
        where: and(
          eq(modelsTable.structId, bridge.structId),
          inArray(modelsTable.modelId, modelIds)
        )
      })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let queryIds = [...new Set(mconfigs.map(x => x.queryId))];

    let queries = await this.queriesService.getQueriesCheckExistSkipSqlData({
      queryIds: queryIds,
      projectId: projectId
    });

    let runningQueries: QueryTab[] = [];
    let startedQueryIds: string[] = [];

    let googleApiConnectionIds = queries
      .filter(query => query.connectionType === ConnectionTypeEnum.GoogleApi)
      .map(query => query.connectionId);

    // console.log('googleApiConnectionIds');
    // console.log(googleApiConnectionIds);

    let uniqueGoogleApiConnectionIdsWithAnyEnvId = [
      ...new Set(googleApiConnectionIds)
    ];

    // console.log('uniqueGoogleApiConnectionIds');
    // console.log(uniqueGoogleApiConnectionIds);

    let uniqueGoogleApiConnectionsWithAnyEnvId =
      await this.db.drizzle.query.connectionsTable
        .findMany({
          where: and(
            eq(connectionsTable.projectId, projectId),
            inArray(
              connectionsTable.connectionId,
              uniqueGoogleApiConnectionIdsWithAnyEnvId
            )
          )
        })
        .then(xs => xs.map(x => this.tabService.connectionEntToTab(x)));

    await forEachSeries(
      uniqueGoogleApiConnectionsWithAnyEnvId,
      async connection => {
        // console.log('googleApiConnections start');
        // let tsStart = Date.now();

        let authClient = new JWT({
          email:
            connection.options.storeGoogleApi.serviceAccountCredentials
              .client_email,
          key: connection.options.storeGoogleApi.serviceAccountCredentials
            .private_key,
          scopes: connection.options.storeGoogleApi.googleAuthScopes
        });

        let tokens = await authClient.authorize();

        connection.options.storeGoogleApi.googleAccessToken =
          tokens.access_token;

        // console.log(Date.now() - tsStart);
        // console.log('googleApiConnections end');

        await retry(
          async () =>
            await this.db.drizzle.transaction(
              async tx =>
                await this.db.packer.write({
                  tx: tx,
                  insertOrUpdate: {
                    connections: [connection]
                  }
                })
            ),
          getRetryOption(this.cs, this.logger)
        );
      }
    );

    if (isDefined(poolSize)) {
      startedQueryIds = queryIds;
      let pSize = Number(poolSize);

      asyncPool(pSize, queryIds, async queryId => {
        let query = await this.queriesService.getQueryCheckExistsSkipData({
          projectId: projectId,
          queryId: queryId
        });

        await this.membersService.getMemberCheckExists({
          projectId: query.projectId,
          memberId: user.userId
        });

        let apiEnvs = await this.envsService.getApiEnvs({
          projectId: projectId
        });

        let apiEnv = apiEnvs.find(x => x.envId === query.envId);

        let connection: ConnectionTab =
          await this.connectionsService.getConnectionCheckExists({
            projectId: query.projectId,
            envId:
              apiEnv.isFallbackToProdConnections === true &&
              apiEnv.fallbackConnectionIds.indexOf(query.connectionId) > -1
                ? PROJECT_ENV_PROD
                : query.envId,
            connectionId: query.connectionId
          });

        if (connection.type === ConnectionTypeEnum.BigQuery) {
          query = await this.bigqueryService.runQuery({
            userId: user.userId,
            query: query,
            connection: connection
          });

          await retry(
            async () =>
              await this.db.drizzle.transaction(
                async tx =>
                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: {
                      queries: [query]
                    }
                  })
              ),
            getRetryOption(this.cs, this.logger)
          );
        } else {
          query.status = QueryStatusEnum.Running;
          query.queryJobId = makeId();
          query.lastRunBy = user.userId;
          query.lastRunTs = makeTsNumber();

          await retry(
            async () =>
              await this.db.drizzle.transaction(
                async tx =>
                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: {
                      queries: [query]
                    }
                  })
              ),
            getRetryOption(this.cs, this.logger)
          );

          if (connection.type === ConnectionTypeEnum.SnowFlake) {
            await this.snowflakeService.runQuery({
              connection: connection,
              queryId: query.queryId,
              queryJobId: query.queryJobId,
              querySql: query.sql,
              projectId: projectId
            });
          } else if (connection.type === ConnectionTypeEnum.ClickHouse) {
            await this.clickhouseService.runQuery({
              connection: connection,
              queryId: query.queryId,
              queryJobId: query.queryJobId,
              querySql: query.sql,
              projectId: projectId
            });
          } else if (connection.type === ConnectionTypeEnum.PostgreSQL) {
            await this.pgService.runQuery({
              connection: connection,
              queryId: query.queryId,
              queryJobId: query.queryJobId,
              querySql: query.sql,
              projectId: projectId
            });
          } else if (connection.type === ConnectionTypeEnum.MySQL) {
            await this.mysqlService.runQuery({
              connection: connection,
              queryId: query.queryId,
              queryJobId: query.queryJobId,
              querySql: query.sql,
              projectId: projectId
            });
          } else if (connection.type === ConnectionTypeEnum.MotherDuck) {
            await this.duckdbService.runQuery({
              connection: connection,
              queryId: query.queryId,
              queryJobId: query.queryJobId,
              querySql: query.sql,
              projectId: projectId
            });
          } else if (connection.type === ConnectionTypeEnum.Presto) {
            await this.prestoService.runQuery({
              connection: connection,
              queryId: query.queryId,
              queryJobId: query.queryJobId,
              querySql: query.sql,
              projectId: projectId
            });
          } else if (connection.type === ConnectionTypeEnum.Trino) {
            await this.trinoService.runQuery({
              connection: connection,
              queryId: query.queryId,
              queryJobId: query.queryJobId,
              querySql: query.sql,
              projectId: projectId
            });
          } else if (
            [ConnectionTypeEnum.Api, ConnectionTypeEnum.GoogleApi].indexOf(
              connection.type
            ) > -1
          ) {
            let mconfig = mconfigs.find(x => x.queryId === query.queryId);
            let model = models.find(x => x.modelId === mconfig.modelId);

            await this.storeService.runQuery({
              projectId: projectId,
              connection: connection,
              model: model,
              queryId: query.queryId,
              queryJobId: query.queryJobId
            });
          }
        }
      }).catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_RUN_QUERIES_POOL_ERROR,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      });
    } else {
      await asyncPool(8, queryIds, async queryId => {
        let query = await this.queriesService.getQueryCheckExistsSkipData({
          projectId: projectId,
          queryId: queryId
        });

        await this.membersService.getMemberCheckExists({
          projectId: query.projectId,
          memberId: user.userId
        });

        let apiEnvs = await this.envsService.getApiEnvs({
          projectId: projectId
        });

        let apiEnv = apiEnvs.find(x => x.envId === query.envId);

        let connection: ConnectionTab =
          await this.connectionsService.getConnectionCheckExists({
            projectId: query.projectId,
            envId:
              apiEnv.isFallbackToProdConnections === true &&
              apiEnv.fallbackConnectionIds.indexOf(query.connectionId) > -1
                ? PROJECT_ENV_PROD
                : query.envId,
            connectionId: query.connectionId
          });

        if (connection.type === ConnectionTypeEnum.BigQuery) {
          query = await this.bigqueryService.runQuery({
            userId: user.userId,
            query: query,
            connection: connection
          });

          await retry(
            async () =>
              await this.db.drizzle.transaction(
                async tx =>
                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: {
                      queries: [query]
                    }
                  })
              ),
            getRetryOption(this.cs, this.logger)
          );

          runningQueries.push(query);
        } else {
          query.status = QueryStatusEnum.Running;
          query.queryJobId = makeId();
          query.lastRunBy = user.userId;
          query.lastRunTs = makeTsNumber();

          await retry(
            async () =>
              await this.db.drizzle.transaction(
                async tx =>
                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: {
                      queries: [query]
                    }
                  })
              ),
            getRetryOption(this.cs, this.logger)
          );

          runningQueries.push(query);

          if (connection.type === ConnectionTypeEnum.SnowFlake) {
            this.snowflakeService
              .runQuery({
                connection: connection,
                queryId: query.queryId,
                queryJobId: query.queryJobId,
                querySql: query.sql,
                projectId: projectId
              })
              .catch(e => {
                logToConsoleBackend({
                  log: new ServerError({
                    message: ErEnum.BACKEND_RUN_QUERY_SNOWFLAKE_ERROR,
                    originalError: e
                  }),
                  logLevel: LogLevelEnum.Error,
                  logger: this.logger,
                  cs: this.cs
                });
              });
          } else if (connection.type === ConnectionTypeEnum.ClickHouse) {
            this.clickhouseService
              .runQuery({
                connection: connection,
                queryId: query.queryId,
                queryJobId: query.queryJobId,
                querySql: query.sql,
                projectId: projectId
              })
              .catch(e => {
                logToConsoleBackend({
                  log: new ServerError({
                    message: ErEnum.BACKEND_RUN_QUERY_CLICKHOUSE_ERROR,
                    originalError: e
                  }),
                  logLevel: LogLevelEnum.Error,
                  logger: this.logger,
                  cs: this.cs
                });
              });
          } else if (connection.type === ConnectionTypeEnum.PostgreSQL) {
            this.pgService
              .runQuery({
                connection: connection,
                queryId: query.queryId,
                queryJobId: query.queryJobId,
                querySql: query.sql,
                projectId: projectId
              })
              .catch(e => {
                logToConsoleBackend({
                  log: new ServerError({
                    message: ErEnum.BACKEND_RUN_QUERY_POSTGRES_ERROR,
                    originalError: e
                  }),
                  logLevel: LogLevelEnum.Error,
                  logger: this.logger,
                  cs: this.cs
                });
              });
          } else if (connection.type === ConnectionTypeEnum.MySQL) {
            this.mysqlService
              .runQuery({
                connection: connection,
                queryId: query.queryId,
                queryJobId: query.queryJobId,
                querySql: query.sql,
                projectId: projectId
              })
              .catch(e => {
                logToConsoleBackend({
                  log: new ServerError({
                    message: ErEnum.BACKEND_RUN_QUERY_MYSQL_ERROR,
                    originalError: e
                  }),
                  logLevel: LogLevelEnum.Error,
                  logger: this.logger,
                  cs: this.cs
                });
              });
          } else if (connection.type === ConnectionTypeEnum.Presto) {
            this.prestoService
              .runQuery({
                connection: connection,
                queryId: query.queryId,
                queryJobId: query.queryJobId,
                querySql: query.sql,
                projectId: projectId
              })
              .catch(e => {
                logToConsoleBackend({
                  log: new ServerError({
                    message: ErEnum.BACKEND_RUN_QUERY_PRESTO_ERROR,
                    originalError: e
                  }),
                  logLevel: LogLevelEnum.Error,
                  logger: this.logger,
                  cs: this.cs
                });
              });
          } else if (connection.type === ConnectionTypeEnum.Trino) {
            this.trinoService
              .runQuery({
                connection: connection,
                queryId: query.queryId,
                queryJobId: query.queryJobId,
                querySql: query.sql,
                projectId: projectId
              })
              .catch(e => {
                logToConsoleBackend({
                  log: new ServerError({
                    message: ErEnum.BACKEND_RUN_QUERY_TRINO_ERROR,
                    originalError: e
                  }),
                  logLevel: LogLevelEnum.Error,
                  logger: this.logger,
                  cs: this.cs
                });
              });
          } else if (connection.type === ConnectionTypeEnum.MotherDuck) {
            this.duckdbService
              .runQuery({
                connection: connection,
                queryId: query.queryId,
                queryJobId: query.queryJobId,
                querySql: query.sql,
                projectId: projectId
              })
              .catch(e => {
                logToConsoleBackend({
                  log: new ServerError({
                    message: ErEnum.BACKEND_RUN_QUERY_DUCKDB_ERROR,
                    originalError: e
                  }),
                  logLevel: LogLevelEnum.Error,
                  logger: this.logger,
                  cs: this.cs
                });
              });
          } else if (
            [ConnectionTypeEnum.Api, ConnectionTypeEnum.GoogleApi].indexOf(
              connection.type
            ) > -1
          ) {
            let mconfig = mconfigs.find(x => x.queryId === query.queryId);
            let model = models.find(x => x.modelId === mconfig.modelId);

            this.storeService
              .runQuery({
                projectId: projectId,
                connection: connection,
                model: model,
                queryId: query.queryId,
                queryJobId: query.queryJobId
              })
              .catch(e => {
                logToConsoleBackend({
                  log: new ServerError({
                    message: ErEnum.BACKEND_RUN_QUERY_API_ERROR,
                    originalError: e
                  }),
                  logLevel: LogLevelEnum.Error,
                  logger: this.logger,
                  cs: this.cs
                });
              });
          }
        }
      });
    }

    let payload: ToBackendRunQueriesResponsePayload = {
      runningQueries: runningQueries.map(x =>
        this.queriesService.tabToApi({ query: x })
      ),
      startedQueryIds: startedQueryIds
    };

    return payload;
  }
}
