import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import asyncPool from 'tiny-async-pool';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BigQueryService } from '~backend/services/bigquery.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { ClickHouseService } from '~backend/services/clickhouse.service';
import { ConnectionsService } from '~backend/services/connections.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { PgService } from '~backend/services/pg.service';
import { QueriesService } from '~backend/services/queries.service';
import { SnowFlakeService } from '~backend/services/snowflake.service';
import { StoreService } from '~backend/services/store.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { PROJECT_ENV_PROD } from '~common/constants/top';

let { JWT } = require('google-auth-library');
let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class RunQueriesController {
  constructor(
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private queriesService: QueriesService,
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private pgService: PgService,
    private storeService: StoreService,
    private clickhouseService: ClickHouseService,
    private bigqueryService: BigQueryService,
    private envsService: EnvsService,
    private snowflakeService: SnowFlakeService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries)
  async runQueries(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendRunQueriesRequest = request.body;

    let { projectId, isRepoProd, branchId, envId, mconfigIds, poolSize } =
      reqValid.payload;

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? common.PROD_REPO_ID : user.userId,
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

    let models = await this.db.drizzle.query.modelsTable.findMany({
      where: and(
        eq(modelsTable.structId, bridge.structId),
        inArray(modelsTable.modelId, modelIds)
      )
    });

    let queryIds = [...new Set(mconfigs.map(x => x.queryId))];

    let queries = await this.queriesService.getQueriesCheckExistSkipSqlData({
      queryIds: queryIds,
      projectId: projectId
    });

    let runningQueries: schemaPostgres.QueryEnt[] = [];
    let startedQueryIds: string[] = [];

    let googleApiConnectionIds = queries
      .filter(
        query => query.connectionType === common.ConnectionTypeEnum.GoogleApi
      )
      .map(query => query.connectionId);

    // console.log('googleApiConnectionIds');
    // console.log(googleApiConnectionIds);

    let uniqueGoogleApiConnectionIdsWithAnyEnvId = [
      ...new Set(googleApiConnectionIds)
    ];

    // console.log('uniqueGoogleApiConnectionIds');
    // console.log(uniqueGoogleApiConnectionIds);

    let uniqueGoogleApiConnectionsWithAnyEnvId =
      await this.db.drizzle.query.connectionsTable.findMany({
        where: and(
          eq(connectionsTable.projectId, projectId),
          inArray(
            connectionsTable.connectionId,
            uniqueGoogleApiConnectionIdsWithAnyEnvId
          )
        )
      });

    await forEachSeries(
      uniqueGoogleApiConnectionsWithAnyEnvId,
      async connection => {
        // console.log('googleApiConnections start');
        // let tsStart = Date.now();

        let authClient = new JWT({
          email: (connection.serviceAccountCredentials as any).client_email,
          key: (connection.serviceAccountCredentials as any).private_key,
          scopes: connection.googleAuthScopes
        });

        let tokens = await authClient.authorize();

        connection.googleAccessToken = tokens.access_token;

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

    if (common.isDefined(poolSize)) {
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

        let connection = await this.connectionsService.getConnectionCheckExists(
          {
            projectId: query.projectId,
            envId:
              apiEnv.isFallbackToProdConnections === true &&
              apiEnv.fallbackConnectionIds.indexOf(query.connectionId) > -1
                ? PROJECT_ENV_PROD
                : query.envId,
            connectionId: query.connectionId
          }
        );

        if (connection.type === common.ConnectionTypeEnum.BigQuery) {
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
          query.status = common.QueryStatusEnum.Running;
          query.queryJobId = common.makeId();
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

          if (connection.type === common.ConnectionTypeEnum.SnowFlake) {
            await this.snowflakeService.runQuery({
              connection: connection,
              queryId: query.queryId,
              queryJobId: query.queryJobId,
              querySql: query.sql,
              projectId: projectId
            });
          } else if (connection.type === common.ConnectionTypeEnum.ClickHouse) {
            await this.clickhouseService.runQuery({
              connection: connection,
              queryId: query.queryId,
              queryJobId: query.queryJobId,
              querySql: query.sql,
              projectId: projectId
            });
          } else if (connection.type === common.ConnectionTypeEnum.PostgreSQL) {
            await this.pgService.runQuery({
              connection: connection,
              queryId: query.queryId,
              queryJobId: query.queryJobId,
              querySql: query.sql,
              projectId: projectId
            });
          } else if (
            [
              common.ConnectionTypeEnum.Api,
              common.ConnectionTypeEnum.GoogleApi
            ].indexOf(connection.type) > -1
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
          log: new common.ServerError({
            message: common.ErEnum.BACKEND_RUN_QUERIES_POOL_ERROR,
            originalError: e
          }),
          logLevel: common.LogLevelEnum.Error,
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

        let connection = await this.connectionsService.getConnectionCheckExists(
          {
            projectId: query.projectId,
            envId:
              apiEnv.isFallbackToProdConnections === true &&
              apiEnv.fallbackConnectionIds.indexOf(query.connectionId) > -1
                ? PROJECT_ENV_PROD
                : query.envId,
            connectionId: query.connectionId
          }
        );

        if (connection.type === common.ConnectionTypeEnum.BigQuery) {
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
          query.status = common.QueryStatusEnum.Running;
          query.queryJobId = common.makeId();
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

          if (connection.type === common.ConnectionTypeEnum.SnowFlake) {
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
                  log: new common.ServerError({
                    message: common.ErEnum.BACKEND_RUN_QUERY_SNOWFLAKE_ERROR,
                    originalError: e
                  }),
                  logLevel: common.LogLevelEnum.Error,
                  logger: this.logger,
                  cs: this.cs
                });
              });
          } else if (connection.type === common.ConnectionTypeEnum.ClickHouse) {
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
                  log: new common.ServerError({
                    message: common.ErEnum.BACKEND_RUN_QUERY_CLICKHOUSE_ERROR,
                    originalError: e
                  }),
                  logLevel: common.LogLevelEnum.Error,
                  logger: this.logger,
                  cs: this.cs
                });
              });
          } else if (connection.type === common.ConnectionTypeEnum.PostgreSQL) {
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
                  log: new common.ServerError({
                    message: common.ErEnum.BACKEND_RUN_QUERY_POSTGRES_ERROR,
                    originalError: e
                  }),
                  logLevel: common.LogLevelEnum.Error,
                  logger: this.logger,
                  cs: this.cs
                });
              });
          } else if (
            [
              common.ConnectionTypeEnum.Api,
              common.ConnectionTypeEnum.GoogleApi
            ].indexOf(connection.type) > -1
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
                  log: new common.ServerError({
                    message: common.ErEnum.BACKEND_RUN_QUERY_API_ERROR,
                    originalError: e
                  }),
                  logLevel: common.LogLevelEnum.Error,
                  logger: this.logger,
                  cs: this.cs
                });
              });
          }
        }
      });
    }

    let payload: apiToBackend.ToBackendRunQueriesResponsePayload = {
      runningQueries: runningQueries.map(x => {
        delete x.sql;
        return this.wrapToApiService.wrapToApiQuery(x);
      }),
      startedQueryIds: startedQueryIds
    };

    return payload;
  }
}
