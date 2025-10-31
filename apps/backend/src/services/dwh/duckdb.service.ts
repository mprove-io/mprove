import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import type { DuckDbError, TableData } from 'duckdb';
import { Database } from 'duckdb';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { ConnectionTab } from '~backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { isDefined } from '~common/functions/is-defined';
import { TestConnectionResult } from '~common/interfaces/to-backend/connections/to-backend-test-connection';
import { TabService } from '../tab.service';

let retry = require('async-retry');

@Injectable()
export class DuckDbService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  optionsToDuckDbOptions(item: {
    connection: ConnectionTab;
  }) {
    let { connection } = item;

    let dbPath =
      connection.options.motherduck.attachModeSingle === true &&
      connection.options.motherduck.database?.length > 0
        ? `md:${connection.options.motherduck.database}?attach_mode=single&saas_mode=true`
        : `md:${connection.options.motherduck.database}?saas_mode=true`;

    let duckdbConnectionOptions: Record<string, string> = {
      motherduck_token: connection.options.motherduck.motherduckToken
    };

    if (connection.options.motherduck.accessModeReadOnly === true) {
      duckdbConnectionOptions.access_mode = 'READ_ONLY';
    }

    return { duckdbConnectionOptions, dbPath };
  }

  async testConnection(item: {
    connection: ConnectionTab;
  }): Promise<TestConnectionResult> {
    let { connection } = item;

    try {
      let { duckdbConnectionOptions, dbPath } = this.optionsToDuckDbOptions({
        connection: connection
      });

      await new Promise<void>((resolve, reject) => {
        let db = new Database(dbPath, duckdbConnectionOptions, err => {
          if (err) {
            reject(err);
            return;
          }
        });

        if (!!db) {
          db.all('SELECT 1', (queryErr: Error | null) => {
            if (queryErr) {
              db.close();
              reject(queryErr);
              return;
            }

            db.close(closeErr => {
              if (closeErr) {
                reject(closeErr);
              } else {
                resolve();
              }
            });
          });
        }
      });

      return {
        isSuccess: true,
        errorMessage: undefined
      };
    } catch (err: any) {
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
    projectId: string;
    querySql: string;
  }): Promise<void> {
    let { connection, queryJobId, queryId, querySql, projectId } = item;

    let { duckdbConnectionOptions, dbPath } = this.optionsToDuckDbOptions({
      connection: connection
    });

    let db = new Database(dbPath, duckdbConnectionOptions, async err => {
      if (err) {
        this.processError({
          e: err,
          queryId: queryId,
          queryJobId: queryJobId,
          projectId: projectId
        });
      }
    });

    let dbQuery = new Promise<TableData>((resolve, reject) => {
      if (!!db) {
        db.all(querySql, (err: DuckDbError | null, rows: TableData) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      } else {
        reject(new Error('duckdbService: db is not defined'));
      }
    });

    dbQuery
      .then(async data => {
        data = JSON.parse(
          JSON.stringify(data, (_key, value) => {
            if (typeof value === 'bigint') {
              return Number(value);
            }
            return value;
          })
        );

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
          q.data = data;
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
      .catch(async e =>
        this.processError({
          e: e,
          queryId: queryId,
          queryJobId: queryJobId,
          projectId: projectId
        })
      );

    db.close();

    // import {
    //   type DuckDBConnection,
    //   DuckDBInstance,
    //   DuckDBValue
    // } from '@duckdb/node-api';
    // import { DuckDBResultReader } from '@duckdb/node-api/lib/DuckDBResultReader';

    // let instance = await DuckDBInstance.create(dbPath, opts);
    // let dc: DuckDBConnection = await instance.connect();

    // await dc
    //   .runAndReadAll(querySql)
    //   .then(async (reader: DuckDBResultReader) => {
    //     let data: Record<string, DuckDBValue>[] = reader.getRowObjects();

    //     data = JSON.parse(
    //       JSON.stringify(data, (_key, value) => {
    //         if (typeof value === 'bigint') {
    //           return Number(value);
    //         }
    //         return value;
    //       })
    //     );

    //     let q = await this.db.drizzle.query.queriesTable.findFirst({
    //       where: and(
    //         eq(queriesTable.queryId, queryId),
    //         eq(queriesTable.queryJobId, queryJobId),
    //         eq(queriesTable.projectId, projectId)
    //       )
    //     });

    //     if (isDefined(q)) {
    //       q.status = QueryStatusEnum.Completed;
    //       q.queryJobId = undefined;
    //       q.data = data;
    //       q.lastCompleteTs = makeTsNumber();
    //       q.lastCompleteDuration = Math.floor(
    //         (Number(q.lastCompleteTs) - Number(q.lastRunTs)) / 1000
    //       );

    //       await retry(
    //         async () =>
    //           await this.db.drizzle.transaction(
    //             async tx =>
    //               await this.db.packer.write({
    //                 tx: tx,
    //                 insertOrUpdate: {
    //                   queries: [q]
    //                 }
    //               })
    //           ),
    //         getRetryOption(this.cs, this.logger)
    //       );
    //     }
    //   })
    //   .catch(async e =>
    //     this.processError({
    //       e: e,
    //       queryId: queryId,
    //       queryJobId: queryJobId,
    //       projectId: projectId
    //     })
    //   );
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
