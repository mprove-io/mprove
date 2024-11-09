import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
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
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class RunQueriesController {
  constructor(
    private queriesService: QueriesService,
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private pgService: PgService,
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

    if (common.isDefined(poolSize)) {
      startedQueryIds = queryIds;
      pSize = Number(poolSize);

      asyncPool(pSize, queryIds, async queryId => {
        let query = await this.queriesService.getQueryCheckExistsSkipData({
          projectId: projectId,
          queryId: queryId
        });

        let member = await this.membersService.getMemberCheckExists({
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

          // await this.dbService.writeRecords({
          //   modify: true,
          //   records: {
          //     queries: [query]
          //   }
          // });
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

          // await this.dbService.writeRecords({
          //   modify: true,
          //   records: {
          //     queries: [query]
          //   }
          // });

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

        let member = await this.membersService.getMemberCheckExists({
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

          // let records = await this.dbService.writeRecords({
          //   modify: true,
          //   records: {
          //     queries: [query]
          //   }
          // });

          runningQueries.push(query);
          // runningQueries.push(records.queries[0]);
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

          // let records = await this.dbService.writeRecords({
          //   modify: true,
          //   records: {
          //     queries: [query]
          //   }
          // });

          runningQueries.push(query);
          // runningQueries.push(records.queries[0]);

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
