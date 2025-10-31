import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import * as snowflake from 'snowflake-sdk';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { ConnectionTab } from '~backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { isDefined } from '~common/functions/is-defined';
import { TestConnectionResult } from '~common/interfaces/to-backend/connections/to-backend-test-connection';
import { ServerError } from '~common/models/server-error';
import { TabService } from '../tab.service';

let retry = require('async-retry');

@Injectable()
export class SnowFlakeService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  optionsToSnowFlakeOptions(item: {
    connection: ConnectionTab;
  }) {
    let { connection } = item;

    let connectionOptions: snowflake.ConnectionOptions = {
      account: connection.options.snowflake.account,
      warehouse: connection.options.snowflake.warehouse,
      database: connection.options.snowflake.database,
      username: connection.options.snowflake.username,
      password: connection.options.snowflake.password,
      sfRetryMaxLoginRetries: 1
    };

    return connectionOptions;
  }

  async testConnection(item: {
    connection: ConnectionTab;
  }): Promise<TestConnectionResult> {
    let { connection } = item;

    let snoflakeOptions = this.optionsToSnowFlakeOptions({
      connection: connection
    });

    let snowflakeConnection = snowflake.createConnection(snoflakeOptions);

    try {
      await new Promise<void>((resolve, reject) => {
        snowflakeConnection.connect((err, conn) => {
          if (err) {
            reject(err);
            return;
          }

          conn.execute({
            sqlText: 'SELECT 1',
            complete: (err, stmt, rows) => {
              if (err) {
                reject(err);
              } else {
                conn.destroy(destroyErr => {
                  if (destroyErr) {
                    reject(destroyErr);
                  } else {
                    resolve();
                  }
                });
              }
            }
          });
        });
      });

      return {
        isSuccess: true,
        errorMessage: undefined
      };
    } catch (err: any) {
      // snowflakeConnection?.destroy(destroyErr => {
      //   if (destroyErr) {
      //     logToConsoleBackend({
      //       log: new ServerError({
      //         message: ErEnum.BACKEND_SNOWFLAKE_FAILED_TO_DESTROY_CONNECTION,
      //         originalError: destroyErr
      //       }),
      //       logLevel: LogLevelEnum.Error,
      //       logger: this.logger,
      //       cs: this.cs
      //     });
      //   }
      // });

      return {
        isSuccess: false,
        errorMessage: `Connection failed: ${err.message}`
      };
    }
  }

  async runQuery(item: {
    connection: ConnectionTab;
    queryJobId: string;
    queryId: string;
    querySql: string;
    projectId: string;
  }): Promise<void> {
    let { connection, queryJobId, queryId, querySql, projectId } = item;

    let snoflakeOptions = this.optionsToSnowFlakeOptions({
      connection: connection
    });

    let snowflakeConnection = snowflake.createConnection(snoflakeOptions);

    snowflakeConnection.connect((err, conn) => {
      if (err) {
        this.processError({
          e: err,
          queryId: queryId,
          queryJobId: queryJobId,
          projectId: projectId
        });
      }
    });

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

    await this.snowflakeConnectionExecute(snowflakeConnection, {
      sqlText: querySql
    })
      .then(async (data: any) => {
        let q = await this.db.drizzle.query.queriesTable
          .findFirst({
            where: and(
              eq(queriesTable.queryId, queryId),
              eq(queriesTable.queryJobId, queryJobId),
              eq(queriesTable.projectId, projectId)
            )
          })
          .then(x => this.tabService.queryEntToTab(x));

        if (isDefined(q)) {
          q.status = QueryStatusEnum.Completed;
          q.queryJobId = undefined;
          q.data = data.rows;
          q.lastCompleteTs = makeTsNumber();
          q.lastCompleteDuration = Math.floor(
            (Number(q.lastCompleteTs) - Number(q.lastRunTs)) / 1000
          );

          await retry(
            async () =>
              await this.db.drizzle.transaction(
                async tx =>
                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: {
                      queries: [q]
                    }
                  })
              ),
            getRetryOption(this.cs, this.logger)
          );
        }
      })
      .catch(async e => {
        await this.processError({
          e: e,
          queryId: queryId,
          queryJobId: queryJobId,
          projectId: projectId
        });
      });

    snowflakeConnection.destroy((err, conn) => {
      if (err) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_SNOWFLAKE_FAILED_TO_DESTROY_CONNECTION,
            originalError: err
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    });
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

  async processError(item: {
    e: any;
    queryId: string;
    queryJobId: string;
    projectId: string;
  }) {
    let { e, queryId, queryJobId, projectId } = item;

    let q = await this.db.drizzle.query.queriesTable
      .findFirst({
        where: and(
          eq(queriesTable.queryId, queryId),
          eq(queriesTable.queryJobId, queryJobId),
          eq(queriesTable.projectId, projectId)
        )
      })
      .then(x => this.tabService.queryEntToTab(x));

    if (isDefined(q)) {
      q.status = QueryStatusEnum.Error;
      q.data = [];
      q.queryJobId = undefined;
      q.lastErrorMessage = e.message;
      q.lastErrorTs = makeTsNumber();

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insertOrUpdate: {
                  queries: [q]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }
  }
}
