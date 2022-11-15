import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as snowflake from 'snowflake-sdk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { DbService } from '~backend/services/db.service';

@Injectable()
export class SnowFlakeService {
  constructor(
    private queriesRepository: repositories.QueriesRepository,
    private dbService: DbService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

  async runQuery(item: {
    userId: string;
    query: entities.QueryEntity;
    connection: entities.ConnectionEntity;
  }) {
    let { query, userId, connection } = item;

    let queryJobId = common.makeId();

    query.status = common.QueryStatusEnum.Running;
    query.query_job_id = queryJobId;
    query.last_run_by = userId;
    query.last_run_ts = helper.makeTs();

    await this.dbService.writeRecords({
      modify: true,
      records: {
        queries: [query]
      }
    });

    let options: snowflake.ConnectionOptions = {
      account: connection.account,
      warehouse: connection.warehouse,
      username: connection.username,
      password: connection.password
      // database: '',
      //  database?: string | undefined;
      //  schema?: string | undefined;
      //  warehouse?: string | undefined;
      //  role?: string | undefined;
      //  clientSessionKeepAlive?: boolean | undefined;
      //  clientSessionKeepAliveHeartbeatFrequency?: number | undefined;
      //  jsTreatIntegerAsBigInt?: boolean | undefined;
      //  application?: string;
      //  authenticator?: string;
      //  token?: string;
      //  privateKey?: string | Buffer;
      //  privateKeyPath?: string;
      //  privateKeyPass?: string;
    };

    let snowflakeConnection = snowflake.createConnection(options);

    let logger = this.logger;
    let cs = this.cs;

    snowflakeConnection.connect(function (err, conn): void {
      if (err) {
        logToConsoleBackend({
          log: new common.ServerError({
            message: common.ErEnum.BACKEND_SNOWFLAKE_FAILED_TO_CONNECT,
            originalError: err
          }),
          logLevel: common.LogLevelEnum.Error,
          logger: logger,
          cs: cs
        });
      }
    });

    // // eslint-disable-next-line @typescript-eslint/no-this-alias
    // let self = this;

    // snowflakeConnection.execute({
    //   sqlText: query.sql,
    //   complete: function (err, stmt, rows) {
    //     if (err) {
    //       self.getQueryError({
    //         queryJobId: queryJobId,
    //         query: query,
    //         e: err
    //       });
    //       self.destroyConnection(snowflakeConnection);
    //     } else {
    //       self.getQueryResults({
    //         queryJobId: queryJobId,
    //         query: query,
    //         data: { stmt, rows }
    //       });
    //       self.destroyConnection(snowflakeConnection);
    //     }
    //   }
    // });

    this.snowflakeConnectionExecute(snowflakeConnection, {
      sqlText: query.sql
      // ,
      // fetchAsString: ['Number', 'Date']
    })
      .then(async (data: any) => {
        let q = await this.queriesRepository.findOne({
          where: {
            query_id: query.query_id,
            query_job_id: queryJobId
          }
        });

        if (common.isDefined(q)) {
          q.status = common.QueryStatusEnum.Completed;
          q.query_job_id = null;
          q.data = data.rows;
          q.last_complete_ts = helper.makeTs();
          q.last_complete_duration = Math.floor(
            (Number(q.last_complete_ts) - Number(q.last_run_ts)) / 1000
          ).toString();

          await this.dbService.writeRecords({
            modify: true,
            records: {
              queries: [q]
            }
          });
        }
        this.snowflakeConnectionDestroy(snowflakeConnection);
      })
      .catch(async e => {
        let q = await this.queriesRepository.findOne({
          where: {
            query_id: query.query_id,
            query_job_id: queryJobId
          }
        });

        if (common.isDefined(q)) {
          q.status = common.QueryStatusEnum.Error;
          q.data = [];
          q.query_job_id = null;
          q.last_error_message = e.message;
          q.last_error_ts = helper.makeTs();

          await this.dbService.writeRecords({
            modify: true,
            records: {
              queries: [q]
            }
          });
        }
        this.snowflakeConnectionDestroy(snowflakeConnection);
      });

    return query;
  }

  async snowflakeConnectionExecute(
    sfConnection: snowflake.Connection,
    execOptions: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const statement = sfConnection.execute({
        ...execOptions,
        complete: function (err, stmt, rows) {
          if (err) {
            reject(err);
          } else {
            resolve({ stmt, rows });
          }
        }
      });
    });
  }

  snowflakeConnectionDestroy(snowflakeConnection: snowflake.Connection) {
    if (snowflakeConnection.isUp()) {
      let logger = this.logger;
      let cs = this.cs;

      snowflakeConnection.destroy(function (err, conn) {
        if (err) {
          logToConsoleBackend({
            log: new common.ServerError({
              message:
                common.ErEnum.BACKEND_SNOWFLAKE_FAILED_TO_DESTROY_CONNECTION,
              originalError: err
            }),
            logLevel: common.LogLevelEnum.Error,
            logger: logger,
            cs: cs
          });
        }
      });
    }
  }
}
