import { Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BigQueryService } from '~backend/services/bigquery.service';
import { ClickHouseService } from '~backend/services/clickhouse.service';
import { ConnectionsService } from '~backend/services/connections.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { PgService } from '~backend/services/pg.service';
import { QueriesService } from '~backend/services/queries.service';
import { SnowFlakeService } from '~backend/services/snowflake.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class RunQueriesController {
  constructor(
    private queriesService: QueriesService,
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private dbService: DbService,
    private pgService: PgService,
    private clickhouseService: ClickHouseService,
    private bigqueryService: BigQueryService,
    private snowflakeService: SnowFlakeService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries)
  async runQueries(
    @AttachUser() user: schemaPostgres.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendRunQueriesRequest = request.body;

    let { projectId, queryIds, poolSize } = reqValid.payload;

    let runningQueries: schemaPostgres.QueryEntity[] = [];
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
          projectId: query.project_id,
          memberId: user.user_id
        });

        let connection = await this.connectionsService.getConnectionCheckExists(
          {
            projectId: query.project_id,
            envId: query.env_id,
            connectionId: query.connection_id
          }
        );

        if (connection.type === common.ConnectionTypeEnum.BigQuery) {
          query = await this.bigqueryService.runQuery({
            userId: user.user_id,
            query: query,
            connection: connection
          });

          await this.dbService.writeRecords({
            modify: true,
            records: {
              queries: [query]
            }
          });
        } else {
          query.status = common.QueryStatusEnum.Running;
          query.query_job_id = common.makeId();
          query.last_run_by = user.user_id;
          query.last_run_ts = helper.makeTs();

          await this.dbService.writeRecords({
            modify: true,
            records: {
              queries: [query]
            }
          });

          if (connection.type === common.ConnectionTypeEnum.SnowFlake) {
            await this.snowflakeService.runQuery({
              connection: connection,
              queryId: query.query_id,
              queryJobId: query.query_job_id,
              querySql: query.sql,
              projectId: projectId
            });
          } else if (connection.type === common.ConnectionTypeEnum.ClickHouse) {
            await this.clickhouseService.runQuery({
              connection: connection,
              queryId: query.query_id,
              queryJobId: query.query_job_id,
              querySql: query.sql,
              projectId: projectId
            });
          } else if (connection.type === common.ConnectionTypeEnum.PostgreSQL) {
            await this.pgService.runQuery({
              connection: connection,
              queryId: query.query_id,
              queryJobId: query.query_job_id,
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
          projectId: query.project_id,
          memberId: user.user_id
        });

        let connection = await this.connectionsService.getConnectionCheckExists(
          {
            projectId: query.project_id,
            envId: query.env_id,
            connectionId: query.connection_id
          }
        );

        if (connection.type === common.ConnectionTypeEnum.BigQuery) {
          query = await this.bigqueryService.runQuery({
            userId: user.user_id,
            query: query,
            connection: connection
          });

          let records = await this.dbService.writeRecords({
            modify: true,
            records: {
              queries: [query]
            }
          });

          runningQueries.push(records.queries[0]);
        } else {
          query.status = common.QueryStatusEnum.Running;
          query.query_job_id = common.makeId();
          query.last_run_by = user.user_id;
          query.last_run_ts = helper.makeTs();

          let records = await this.dbService.writeRecords({
            modify: true,
            records: {
              queries: [query]
            }
          });

          runningQueries.push(records.queries[0]);

          if (connection.type === common.ConnectionTypeEnum.SnowFlake) {
            this.snowflakeService
              .runQuery({
                connection: connection,
                queryId: query.query_id,
                queryJobId: query.query_job_id,
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
                queryId: query.query_id,
                queryJobId: query.query_job_id,
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
                queryId: query.query_id,
                queryJobId: query.query_job_id,
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
        return wrapper.wrapToApiQuery(x);
      }),
      startedQueryIds: startedQueryIds
    };

    return payload;
  }
}
