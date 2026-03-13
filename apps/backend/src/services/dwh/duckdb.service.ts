import { type DuckDBConnection, DuckDBInstance, Json } from '@duckdb/node-api';
import { DuckDBResultReader } from '@duckdb/node-api/lib/DuckDBResultReader';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
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
export class DuckDbService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  optionsToDuckDbOptions(item: { connection: ConnectionTab }) {
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

    let { duckdbConnectionOptions, dbPath } = this.optionsToDuckDbOptions({
      connection: connection
    });

    try {
      let db: DuckDBInstance = await DuckDBInstance.create(
        dbPath,
        duckdbConnectionOptions
      );

      let dc: DuckDBConnection = await db.connect();

      await dc.runAndReadAll('SELECT 1');

      dc.closeSync();
      db.closeSync();

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

  async fetchSample(item: {
    connection: ConnectionTab;
    schemaName: string;
    tableName: string;
    columnName?: string;
    offset?: number;
  }): Promise<{ columnNames: string[]; rows: string[][] }> {
    let { connection, schemaName, tableName, columnName, offset } = item;

    let { duckdbConnectionOptions, dbPath } = this.optionsToDuckDbOptions({
      connection: connection
    });

    let duckDbInstance: DuckDBInstance;
    let dc: DuckDBConnection;

    try {
      duckDbInstance = await DuckDBInstance.create(
        dbPath,
        duckdbConnectionOptions
      );

      dc = await duckDbInstance.connect();

      let sqlText: string;

      if (isDefined(columnName)) {
        sqlText = `SELECT DISTINCT "${columnName}" FROM (SELECT "${columnName}" FROM "${schemaName}"."${tableName}" LIMIT 10000) sub LIMIT 100`;
      } else {
        let sqlOffset = isDefined(offset) ? offset : 0;
        sqlText = `SELECT * FROM "${schemaName}"."${tableName}" LIMIT 100 OFFSET ${sqlOffset}`;
      }

      let reader = await dc.runAndReadAll(sqlText);
      let resultRows = reader.getRowObjectsJson() as any[];

      let columnNames: string[] =
        resultRows.length > 0 ? Object.keys(resultRows[0]) : [];

      let rows: string[][] = resultRows.map(row =>
        columnNames.map(col => (row[col] === null ? 'NULL' : String(row[col])))
      );

      return { columnNames: columnNames, rows: rows };
    } finally {
      dc?.closeSync();
      duckDbInstance?.closeSync();
    }
  }

  async fetchSchema(item: {
    connection: ConnectionTab;
  }): Promise<ConnectionSchema> {
    let { connection } = item;

    let { duckdbConnectionOptions, dbPath } = this.optionsToDuckDbOptions({
      connection: connection
    });

    let duckDbInstance: DuckDBInstance;
    let dc: DuckDBConnection;

    try {
      duckDbInstance = await DuckDBInstance.create(
        dbPath,
        duckdbConnectionOptions
      );

      dc = await duckDbInstance.connect();

      let tablesReader = await dc.runAndReadAll(`
        SELECT table_schema, table_name, table_type
        FROM information_schema.tables
        WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
          AND table_type NOT IN ('LOCAL TEMPORARY')
        ORDER BY table_schema, table_name
      `);
      let tablesRows = tablesReader.getRowObjectsJson() as {
        table_schema: string;
        table_name: string;
        table_type: string;
      }[];

      let columnsReader = await dc.runAndReadAll(`
        SELECT table_schema, table_name, column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
        ORDER BY table_schema, table_name, ordinal_position
      `);
      let columnsRows = columnsReader.getRowObjectsJson() as {
        table_schema: string;
        table_name: string;
        column_name: string;
        data_type: string;
        is_nullable: string;
      }[];

      let fkRows: {
        table_schema: string;
        table_name: string;
        column_name: string;
        constraint_name: string;
        referenced_schema: string;
        referenced_table: string;
        referenced_column: string;
      }[] = [];

      try {
        let fkReader = await dc.runAndReadAll(`
          SELECT
            kcu.table_schema,
            kcu.table_name,
            kcu.column_name,
            kcu.constraint_name,
            ccu.table_schema AS referenced_schema,
            ccu.table_name AS referenced_table,
            ccu.column_name AS referenced_column
          FROM information_schema.key_column_usage kcu
          JOIN information_schema.table_constraints tc
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
            AND tc.constraint_type = 'FOREIGN KEY'
          JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
          WHERE kcu.table_schema NOT IN ('information_schema', 'pg_catalog')
        `);
        fkRows = fkReader.getRowObjectsJson() as typeof fkRows;
      } catch (fkErr: any) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_FETCH_FK_DUCKDB_ERROR,
            originalError: fkErr
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }

      let constraintRows: {
        table_schema: string;
        table_name: string;
        column_name: string;
        constraint_name: string;
        constraint_type: string;
      }[] = [];

      try {
        let constraintReader = await dc.runAndReadAll(`
          SELECT
            tc.table_schema,
            tc.table_name,
            kcu.column_name,
            tc.constraint_name,
            tc.constraint_type
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON kcu.constraint_name = tc.constraint_name
            AND kcu.table_schema = tc.table_schema
          WHERE tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
            AND tc.table_schema NOT IN ('information_schema', 'pg_catalog')
        `);
        constraintRows =
          constraintReader.getRowObjectsJson() as typeof constraintRows;
      } catch (constraintErr: any) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_FETCH_CONSTRAINTS_DUCKDB_ERROR,
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
            cr.table_schema === row.table_schema &&
            cr.table_name === row.table_name
        );

        let constraintNames = [
          ...new Set(tableConstraintRows.map(cr => cr.constraint_name))
        ];

        let indexes: SchemaIndex[] = constraintNames.map(constraintName => {
          let constraintGroup = tableConstraintRows.filter(
            cr => cr.constraint_name === constraintName
          );
          let isPrimaryKey =
            constraintGroup[0].constraint_type === 'PRIMARY KEY';
          return {
            indexName: constraintName,
            indexColumns: constraintGroup.map(cr => cr.column_name),
            isUnique: true,
            isPrimaryKey: isPrimaryKey
          };
        });

        let columns: SchemaColumn[] = columnsRows
          .filter(
            c =>
              c.table_schema === row.table_schema &&
              c.table_name === row.table_name
          )
          .map(c => {
            let foreignKeys: SchemaForeignKey[] = fkRows
              .filter(
                fk =>
                  fk.table_schema === c.table_schema &&
                  fk.table_name === c.table_name &&
                  fk.column_name === c.column_name
              )
              .map(fk => ({
                constraintName: fk.constraint_name,
                referencedSchemaName: fk.referenced_schema,
                referencedTableName: fk.referenced_table,
                referencedColumnName: fk.referenced_column
              }));

            let isPrimaryKey = indexes.some(
              idx =>
                idx.isPrimaryKey === true &&
                idx.indexColumns.includes(c.column_name)
            );

            let isUnique = indexes.some(
              idx =>
                idx.isUnique === true &&
                idx.indexColumns.includes(c.column_name)
            );

            return {
              columnName: c.column_name,
              dataType: c.data_type,
              isNullable: c.is_nullable === 'YES',
              isPrimaryKey: isPrimaryKey,
              isUnique: isUnique,
              foreignKeys: foreignKeys
            };
          });

        return {
          schemaName: row.table_schema,
          tableName: row.table_name,
          tableType: row.table_type,
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
      dc?.closeSync();
      duckDbInstance?.closeSync();
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

    let db: DuckDBInstance = await DuckDBInstance.create(
      dbPath,
      duckdbConnectionOptions
    );

    let dc: DuckDBConnection = await db.connect();

    await dc
      .runAndReadAll(querySql)
      .then(async (reader: DuckDBResultReader) => {
        let data: Record<string, Json>[] = reader.getRowObjectsJson();
        // let data: Record<string, Json>[] = reader.getRowObjects();

        // data = JSON.parse(
        //   JSON.stringify(data, (_key, value) => {
        //     if (typeof value === 'bigint') {
        //       return Number(value);
        //     }
        //     return value;
        //   })
        // );

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

    dc.closeSync();
    db.closeSync();
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
