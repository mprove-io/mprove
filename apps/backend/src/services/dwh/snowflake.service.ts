import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import snowflake from 'snowflake-sdk';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { makeTsNumber } from '#backend/functions/make-ts-number';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ConnectionSchema,
  SchemaColumn,
  SchemaForeignKey,
  SchemaIndex,
  SchemaTable
} from '#common/interfaces/backend/connection-schema';
import { TestConnectionResult } from '#common/interfaces/to-backend/connections/to-backend-test-connection';
import { ServerError } from '#common/models/server-error';
import { TabService } from '../tab.service';

@Injectable()
export class SnowFlakeService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {
    snowflake.configure({ logLevel: 'OFF' });
  }

  optionsToSnowFlakeOptions(item: { connection: ConnectionTab }) {
    let { connection } = item;

    let connectionOptions: snowflake.ConnectionOptions = {
      account: connection.options.snowflake.account,
      warehouse: connection.options.snowflake.warehouse,
      database: connection.options.snowflake.database,
      username: connection.options.snowflake.username,
      password: connection.options.snowflake.password,
      sfRetryMaxLoginRetries: 1 // also in libs/node-common/src/functions/make-malloy-connections.ts
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

  async fetchSchema(item: {
    connection: ConnectionTab;
  }): Promise<ConnectionSchema> {
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
          } else {
            resolve();
          }
        });
      });

      let tablesResult = await this.snowflakeConnectionExecute(
        snowflakeConnection,
        {
          sqlText: `
            SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA != 'INFORMATION_SCHEMA'
              AND TABLE_TYPE NOT IN ('TEMPORARY TABLE')
            ORDER BY TABLE_SCHEMA, TABLE_NAME
          `
        }
      );
      let tablesRows = tablesResult.rows as {
        TABLE_SCHEMA: string;
        TABLE_NAME: string;
        TABLE_TYPE: string;
      }[];

      let columnsResult = await this.snowflakeConnectionExecute(
        snowflakeConnection,
        {
          sqlText: `
            SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA != 'INFORMATION_SCHEMA'
            ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION
          `
        }
      );
      let columnsRows = columnsResult.rows as {
        TABLE_SCHEMA: string;
        TABLE_NAME: string;
        COLUMN_NAME: string;
        DATA_TYPE: string;
        IS_NULLABLE: string;
      }[];

      let fkRows: {
        TABLE_SCHEMA: string;
        TABLE_NAME: string;
        COLUMN_NAME: string;
        CONSTRAINT_NAME: string;
        REFERENCED_SCHEMA: string;
        REFERENCED_TABLE: string;
        REFERENCED_COLUMN: string;
      }[] = [];

      try {
        let fkResult = await this.snowflakeConnectionExecute(
          snowflakeConnection,
          {
            sqlText: `
              SELECT
                fk_tco.TABLE_SCHEMA,
                fk_tco.TABLE_NAME,
                kcu.COLUMN_NAME,
                fk_tco.CONSTRAINT_NAME,
                rco.UNIQUE_CONSTRAINT_SCHEMA AS REFERENCED_SCHEMA,
                pk_tco.TABLE_NAME AS REFERENCED_TABLE,
                pk_kcu.COLUMN_NAME AS REFERENCED_COLUMN
              FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS fk_tco
              JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rco
                ON rco.CONSTRAINT_NAME = fk_tco.CONSTRAINT_NAME
                AND rco.CONSTRAINT_SCHEMA = fk_tco.TABLE_SCHEMA
              JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS pk_tco
                ON pk_tco.CONSTRAINT_NAME = rco.UNIQUE_CONSTRAINT_NAME
                AND pk_tco.TABLE_SCHEMA = rco.UNIQUE_CONSTRAINT_SCHEMA
              JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
                ON kcu.CONSTRAINT_NAME = fk_tco.CONSTRAINT_NAME
                AND kcu.TABLE_SCHEMA = fk_tco.TABLE_SCHEMA
              JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE pk_kcu
                ON pk_kcu.CONSTRAINT_NAME = rco.UNIQUE_CONSTRAINT_NAME
                AND pk_kcu.TABLE_SCHEMA = rco.UNIQUE_CONSTRAINT_SCHEMA
                AND pk_kcu.ORDINAL_POSITION = kcu.ORDINAL_POSITION
              WHERE fk_tco.CONSTRAINT_TYPE = 'FOREIGN KEY'
                AND fk_tco.TABLE_SCHEMA != 'INFORMATION_SCHEMA'
            `
          }
        );
        fkRows = fkResult.rows as typeof fkRows;
      } catch (fkErr: any) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_FETCH_FK_SNOWFLAKE_ERROR,
            originalError: fkErr
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }

      let constraintRows: {
        TABLE_SCHEMA: string;
        TABLE_NAME: string;
        COLUMN_NAME: string;
        CONSTRAINT_NAME: string;
        CONSTRAINT_TYPE: string;
      }[] = [];

      try {
        let constraintResult = await this.snowflakeConnectionExecute(
          snowflakeConnection,
          {
            sqlText: `
              SELECT
                tc.TABLE_SCHEMA,
                tc.TABLE_NAME,
                kcu.COLUMN_NAME,
                tc.CONSTRAINT_NAME,
                tc.CONSTRAINT_TYPE
              FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
              JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
                ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
                AND kcu.TABLE_SCHEMA = tc.TABLE_SCHEMA
              WHERE tc.CONSTRAINT_TYPE IN ('PRIMARY KEY', 'UNIQUE')
                AND tc.TABLE_SCHEMA != 'INFORMATION_SCHEMA'
            `
          }
        );
        constraintRows = constraintResult.rows as typeof constraintRows;
      } catch (constraintErr: any) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_FETCH_CONSTRAINTS_SNOWFLAKE_ERROR,
            originalError: constraintErr
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }

      let tables: SchemaTable[] = tablesRows.map(row => {
        let tableConstraintRows = constraintRows.filter(
          cr =>
            cr.TABLE_SCHEMA === row.TABLE_SCHEMA &&
            cr.TABLE_NAME === row.TABLE_NAME
        );

        let constraintNames = [
          ...new Set(tableConstraintRows.map(cr => cr.CONSTRAINT_NAME))
        ];

        let indexes: SchemaIndex[] = constraintNames.map(constraintName => {
          let constraintGroup = tableConstraintRows.filter(
            cr => cr.CONSTRAINT_NAME === constraintName
          );
          let isPrimaryKey =
            constraintGroup[0].CONSTRAINT_TYPE === 'PRIMARY KEY';
          return {
            indexName: constraintName,
            indexColumns: constraintGroup.map(cr => cr.COLUMN_NAME),
            isUnique: true,
            isPrimaryKey: isPrimaryKey
          };
        });

        let columns: SchemaColumn[] = columnsRows
          .filter(
            c =>
              c.TABLE_SCHEMA === row.TABLE_SCHEMA &&
              c.TABLE_NAME === row.TABLE_NAME
          )
          .map(c => {
            let foreignKeys: SchemaForeignKey[] = fkRows
              .filter(
                fk =>
                  fk.TABLE_SCHEMA === c.TABLE_SCHEMA &&
                  fk.TABLE_NAME === c.TABLE_NAME &&
                  fk.COLUMN_NAME === c.COLUMN_NAME
              )
              .map(fk => ({
                constraintName: fk.CONSTRAINT_NAME,
                referencedSchemaName: fk.REFERENCED_SCHEMA,
                referencedTableName: fk.REFERENCED_TABLE,
                referencedColumnName: fk.REFERENCED_COLUMN
              }));

            let isPrimaryKey = indexes.some(
              idx =>
                idx.isPrimaryKey === true &&
                idx.indexColumns.includes(c.COLUMN_NAME)
            );

            let isUnique = indexes.some(
              idx =>
                idx.isUnique === true &&
                idx.indexColumns.includes(c.COLUMN_NAME)
            );

            return {
              columnName: c.COLUMN_NAME,
              dataType: c.DATA_TYPE,
              isNullable: c.IS_NULLABLE === 'YES',
              isPrimaryKey: isPrimaryKey,
              isUnique: isUnique,
              foreignKeys: foreignKeys
            };
          });

        return {
          schemaName: row.TABLE_SCHEMA,
          tableName: row.TABLE_NAME,
          tableType: row.TABLE_TYPE,
          columns: columns,
          indexes: indexes
        };
      });

      return {
        tables: tables,
        lastRefreshedTs: Date.now(),
        errorMessage: undefined
      };
    } catch (err: any) {
      return {
        tables: [],
        lastRefreshedTs: Date.now(),
        errorMessage: `Schema fetch failed: ${err.message}`
      };
    } finally {
      snowflakeConnection.destroy(destroyErr => {
        if (destroyErr) {
          logToConsoleBackend({
            log: new ServerError({
              message: ErEnum.BACKEND_SNOWFLAKE_FAILED_TO_DESTROY_CONNECTION,
              originalError: destroyErr
            }),
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
        }
      });
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
