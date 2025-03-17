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
import { getRetryOption } from '~backend/functions/get-retry-option';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BigQueryService } from '~backend/services/bigquery.service';
import { ClickHouseService } from '~backend/services/clickhouse.service';
import { ConnectionsService } from '~backend/services/connections.service';
import { MembersService } from '~backend/services/members.service';
import { PgService } from '~backend/services/pg.service';
import { QueriesService } from '~backend/services/queries.service';
import { SnowFlakeService } from '~backend/services/snowflake.service';
import { StoreService } from '~backend/services/store.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

let { JWT } = require('google-auth-library');
let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class RunQueriesController {
  constructor(
    private queriesService: QueriesService,
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private pgService: PgService,
    private storeService: StoreService,
    private clickhouseService: ClickHouseService,
    private bigqueryService: BigQueryService,
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

    let { projectId, queryIds, poolSize } = reqValid.payload;

    let runningQueries: schemaPostgres.QueryEnt[] = [];
    let startedQueryIds: string[] = [];

    let pSize = 1;

    let queries = await this.queriesService.getQueriesCheckExistSkipSqlData({
      queryIds: queryIds,
      projectId: projectId
    });

    let googleApiConnectionIds = queries
      .filter(
        query => query.connectionType === common.ConnectionTypeEnum.GoogleApi
      )
      .map(query => query.connectionId);

    // console.log('googleApiConnectionIds');
    // console.log(googleApiConnectionIds);

    let uniqueGoogleApiConnectionIds = [...new Set(googleApiConnectionIds)];

    // console.log('uniqueGoogleApiConnectionIds');
    // console.log(uniqueGoogleApiConnectionIds);

    let uniqueGoogleApiConnections =
      await this.db.drizzle.query.connectionsTable.findMany({
        where: and(
          eq(connectionsTable.projectId, projectId),
          inArray(connectionsTable.connectionId, uniqueGoogleApiConnectionIds)
        )
      });

    await forEachSeries(uniqueGoogleApiConnections, async connection => {
      // console.log('googleApiConnections start');
      // let tsStart = Date.now();

      let authClient = new JWT({
        email: (connection.serviceAccountCredentials as any).client_email,
        key: (connection.serviceAccountCredentials as any).private_key,
        // TODO: add scopes to connection dialogs
        scopes: ['https://www.googleapis.com/auth/analytics.readonly']
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
    });

    if (common.isDefined(poolSize)) {
      startedQueryIds = queryIds;
      pSize = Number(poolSize);

      asyncPool(pSize, queryIds, async queryId => {
        let query = await this.queriesService.getQueryCheckExistsSkipData({
          projectId: projectId,
          queryId: queryId
        });

        await this.membersService.getMemberCheckExists({
          projectId: query.projectId,
          memberId: user.userId
        });

        let connection = await this.connectionsService.getConnectionCheckExists(
          {
            projectId: query.projectId,
            envId: query.envId,
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
            await this.storeService.runQuery({
              connection: connection,
              queryId: query.queryId,
              queryJobId: query.queryJobId,
              projectId: projectId
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

        let connection = await this.connectionsService.getConnectionCheckExists(
          {
            projectId: query.projectId,
            envId: query.envId,
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
            this.storeService
              .runQuery({
                connection: connection,
                queryId: query.queryId,
                queryJobId: query.queryJobId,
                projectId: projectId
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
