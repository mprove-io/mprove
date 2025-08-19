import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import * as snowflake from 'snowflake-sdk';

import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { makeTsNumber } from '~backend/functions/make-ts-number';

let retry = require('async-retry');

@Injectable()
export class SnowFlakeService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async runQuery(item: {
    connection: ConnectionEnt;
    queryJobId: string;
    queryId: string;
    querySql: string;
    projectId: string;
  }) {
    let { connection, queryJobId, queryId, querySql, projectId } = item;

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
          log: new ServerError({
            message: ErEnum.BACKEND_SNOWFLAKE_FAILED_TO_CONNECT,
            originalError: err
          }),
          logLevel: LogLevelEnum.Error,
          logger: logger,
          cs: cs
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
      // ,
      // fetchAsString: ['Number', 'Date']
    })
      .then(async (data: any) => {
        let q = await this.db.drizzle.query.queriesTable.findFirst({
          where: and(
            eq(queriesTable.queryId, queryId),
            eq(queriesTable.queryJobId, queryJobId),
            eq(queriesTable.projectId, projectId)
          )
        });

        if (isDefined(q)) {
          q.status = QueryStatusEnum.Completed;
          q.queryJobId = undefined; // null;
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
        this.snowflakeConnectionDestroy(snowflakeConnection);
      })
      .catch(async e => {
        let q = await this.db.drizzle.query.queriesTable.findFirst({
          where: and(
            eq(queriesTable.queryId, queryId),
            eq(queriesTable.queryJobId, queryJobId),
            eq(queriesTable.projectId, projectId)
          )
        });

        if (isDefined(q)) {
          q.status = QueryStatusEnum.Error;
          q.data = [];
          q.queryJobId = undefined; // null
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
        this.snowflakeConnectionDestroy(snowflakeConnection);
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

  snowflakeConnectionDestroy(snowflakeConnection: snowflake.Connection) {
    if (snowflakeConnection.isUp()) {
      let logger = this.logger;
      let cs = this.cs;

      snowflakeConnection.destroy(function (err, conn) {
        if (err) {
          logToConsoleBackend({
            log: new ServerError({
              message: ErEnum.BACKEND_SNOWFLAKE_FAILED_TO_DESTROY_CONNECTION,
              originalError: err
            }),
            logLevel: LogLevelEnum.Error,
            logger: logger,
            cs: cs
          });
        }
      });
    }
  }
}
