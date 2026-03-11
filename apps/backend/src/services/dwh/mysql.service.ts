import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import * as MYSQL from 'mysql2/promise';
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
  SchemaIndex,
  SchemaTable
} from '#common/interfaces/backend/connection-schema';
import { TestConnectionResult } from '#common/interfaces/to-backend/connections/to-backend-test-connection';
import { ServerError } from '#common/models/server-error';
import { TabService } from '../tab.service';

@Injectable()
export class MysqlService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  optionsToMysqlOptions(item: { connection: ConnectionTab }) {
    let { connection } = item;

    let connectionOptions: MYSQL.ConnectionOptions = {
      host: connection.options.mysql.host,
      port: connection.options.mysql.port,
      database: connection.options.mysql.database,
      user: connection.options.mysql.user,
      password: connection.options.mysql.password,
      multipleStatements: true,
      decimalNumbers: true,
      timezone: '+00:00'
    };

    return connectionOptions;
  }

  async fetchSchema(item: {
    connection: ConnectionTab;
  }): Promise<ConnectionSchema> {
    let { connection } = item;

    let mysqlConnectionOptions = this.optionsToMysqlOptions({
      connection: connection
    });

    let mc: MYSQL.Connection;

    try {
      mc = await MYSQL.createConnection(mysqlConnectionOptions);

      let [tablesResult] = await mc.query(`
        SELECT table_name, table_type
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
        ORDER BY table_name
      `);
      let tablesRows = tablesResult as {
        TABLE_NAME: string;
        TABLE_TYPE: string;
      }[];

      let [columnsResult] = await mc.query(`
        SELECT table_name, column_name, data_type, is_nullable, column_key
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
        ORDER BY table_name, ordinal_position
      `);
      let columnsRows = columnsResult as {
        TABLE_NAME: string;
        COLUMN_NAME: string;
        DATA_TYPE: string;
        IS_NULLABLE: string;
      }[];

      let [indexesResult] = await mc.query(`
        SELECT table_name, index_name,
          GROUP_CONCAT(column_name ORDER BY seq_in_index) as index_columns,
          non_unique
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
        GROUP BY table_name, index_name, non_unique
        ORDER BY table_name, index_name
      `);
      let indexesRows = indexesResult as {
        TABLE_NAME: string;
        INDEX_NAME: string;
        index_columns: string;
        NON_UNIQUE: number;
      }[];

      let tables: SchemaTable[] = tablesRows.map(row => {
        let tableName = row.TABLE_NAME;

        let columns: SchemaColumn[] = columnsRows
          .filter(c => c.TABLE_NAME === tableName)
          .map(c => ({
            columnName: c.COLUMN_NAME,
            dataType: c.DATA_TYPE,
            isNullable: c.IS_NULLABLE === 'YES'
          }));

        let indexes: SchemaIndex[] = indexesRows
          .filter(ix => ix.TABLE_NAME === tableName)
          .map(ix => {
            let colsStr = ix.index_columns || '';
            let indexColumns = colsStr
              .split(',')
              .map(s => s.trim())
              .filter(s => s.length > 0);

            return {
              indexName: ix.INDEX_NAME,
              indexColumns: indexColumns,
              isUnique: ix.NON_UNIQUE === 0,
              isPrimaryKey: ix.INDEX_NAME === 'PRIMARY'
            };
          });

        return {
          schemaName: connection.options.mysql.database,
          tableName: tableName,
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
      if (isDefined(mc)) {
        mc.end().catch(er => {
          logToConsoleBackend({
            log: new ServerError({
              message: ErEnum.BACKEND_MYSQL_CONNECTION_CLOSE_ERROR,
              originalError: er
            }),
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
        });
      }
    }
  }

  async testConnection(item: {
    connection: ConnectionTab;
  }): Promise<TestConnectionResult> {
    let { connection } = item;

    let mysqlConnectionOptions = this.optionsToMysqlOptions({
      connection: connection
    });

    try {
      let errorMessage: string;

      let mc = await MYSQL.createConnection(mysqlConnectionOptions).catch(e => {
        errorMessage = `Connection failed: ${e.message}`;
      });

      if (isDefined(errorMessage) === true) {
        return {
          isSuccess: false,
          errorMessage: errorMessage
        };
      } else if (!mc) {
        return {
          isSuccess: false,
          errorMessage: 'Connection failed'
        };
      }

      await mc.ping();
      await mc.end();

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

    let mysqlConnectionOptions = this.optionsToMysqlOptions({
      connection: connection
    });

    let mc = await MYSQL.createConnection(mysqlConnectionOptions).catch(
      async e =>
        this.processError({
          e: e,
          queryId: queryId,
          queryJobId: queryJobId,
          projectId: projectId
        })
    );

    if (!mc) {
      return;
    }

    // packages/malloy-db-mysql/src/mysql_connection.ts
    await mc
      .query(
        "set @@session.time_zone = 'UTC';" +
          'SET SESSION group_concat_max_len = 10000000;' +
          "SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));"
      )
      .catch(async e =>
        this.processError({
          e: e,
          queryId: queryId,
          queryJobId: queryJobId,
          projectId: projectId
        })
      );

    await mc
      .query(querySql)
      .then(async (result: [MYSQL.QueryResult, MYSQL.FieldPacket[]]) => {
        let data = result[0];

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

    mc.end().catch(er => {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_MYSQL_CONNECTION_CLOSE_ERROR,
          originalError: er
        }),
        logLevel: LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
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
