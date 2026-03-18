import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  PrestoClientConfig,
  PrestoQuery
} from '@prestodb/presto-js-client';
import _PrestoClientModule from '@prestodb/presto-js-client';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import pIteration from 'p-iteration';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { makeTsNumber } from '#backend/functions/make-ts-number';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import {
  ConnectionRawSchema,
  RawSchemaColumn,
  RawSchemaIndex,
  RawSchemaTable
} from '#common/interfaces/backend/connection-schemas/raw-schema';
import { FetchSampleResult } from '#common/interfaces/to-backend/connections/fetch-sample-result';
import { TestConnectionResult } from '#common/interfaces/to-backend/connections/to-backend-test-connection';
import { TabService } from '../tab.service';

const { forEachSeries } = pIteration;

// CJS interop: default import gets module.exports object, unwrap to get the class
const PrestoClient = (_PrestoClientModule as any)
  .default as typeof _PrestoClientModule;

@Injectable()
export class PrestoService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  optionsToPrestoClientConfig(item: { connection: ConnectionTab }) {
    let { connection } = item;

    let prestoClientConfig: PrestoClientConfig = {
      catalog: connection.options.presto.catalog,
      host: connection.options.presto.server,
      port: connection.options.presto.port,
      schema: connection.options.presto.schema,
      user: connection.options.presto.user,
      basicAuthentication:
        isDefined(connection.options.presto.user) &&
        isDefined(connection.options.presto.password)
          ? {
              user: connection.options.presto.user,
              password: connection.options.presto.password
            }
          : undefined,
      extraHeaders: { 'X-Presto-Session': 'legacy_unnest=true' }
    };

    return prestoClientConfig;
  }

  async testConnection(item: {
    connection: ConnectionTab;
  }): Promise<TestConnectionResult> {
    let { connection } = item;

    let prestoClientConfig = this.optionsToPrestoClientConfig({
      connection: connection
    });

    try {
      let pc = new PrestoClient(prestoClientConfig);

      await pc.query('SELECT 1');

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
  }): Promise<FetchSampleResult> {
    let { connection, schemaName, tableName, columnName, offset } = item;

    let prestoClientConfig = this.optionsToPrestoClientConfig({
      connection: connection
    });

    try {
      let pc = new PrestoClient(prestoClientConfig);

      let catalog = connection.options.presto.catalog;

      let sqlText: string;

      if (isDefined(columnName)) {
        sqlText = `SELECT DISTINCT "${columnName}" FROM (SELECT "${columnName}" FROM "${catalog}"."${schemaName}"."${tableName}" LIMIT 10000) sub LIMIT 100`;
      } else {
        let sqlOffset = isDefined(offset) ? offset : 0;
        sqlText = `SELECT * FROM "${catalog}"."${schemaName}"."${tableName}" OFFSET ${sqlOffset} LIMIT 100`;
      }

      let result: PrestoQuery = await pc.query(sqlText);

      let columns = result.columns;
      let resultRows = result.data.map(r => {
        let dRow: { [name: string]: any } = {};
        columns.forEach((column: any, index: number) => {
          dRow[column.name as string] = r[index];
        });
        return dRow;
      });

      let columnNames: string[] =
        resultRows.length > 0 ? Object.keys(resultRows[0]) : [];

      let rows: string[][] = resultRows.map(row =>
        columnNames.map(col => (row[col] === null ? 'NULL' : String(row[col])))
      );

      return { columnNames: columnNames, rows: rows };
    } catch (e: any) {
      return {
        columnNames: [],
        rows: [],
        errorMessage: `Sample fetch failed: ${e.message}`
      };
    }
  }

  async fetchSchema(item: {
    connection: ConnectionTab;
  }): Promise<ConnectionRawSchema> {
    let { connection } = item;

    let prestoClientConfig = this.optionsToPrestoClientConfig({
      connection: connection
    });

    try {
      let pc = new PrestoClient(prestoClientConfig);

      let catalog = connection.options.presto.catalog;
      let catalogs: string[];
      let catalogDiscovered = false;

      if (isDefinedAndNotEmpty(catalog)) {
        catalogs = [catalog];
      } else {
        catalogDiscovered = true;
        let catalogsResult: PrestoQuery = await pc.query('SHOW CATALOGS');
        catalogs = catalogsResult.data
          .map(r => r[0] as string)
          .filter(c => c !== 'system');
      }

      let allTablesRows: { [name: string]: any }[] = [];
      let allColumnsRows: { [name: string]: any }[] = [];

      await forEachSeries(catalogs, async cat => {
        try {
          let tablesResult: PrestoQuery = await pc.query(`
            SELECT table_schema, table_name, table_type
            FROM ${cat}.information_schema.tables
            WHERE table_schema != 'information_schema'
            ORDER BY table_schema, table_name
          `);

          let tablesColumns = tablesResult.columns;
          let tablesRows = tablesResult.data.map(r => {
            let dRow: { [name: string]: any } = {};
            tablesColumns.forEach((column: any, index: number) => {
              dRow[column.name as string] = r[index];
            });
            return dRow;
          });

          let columnsResult: PrestoQuery = await pc.query(`
            SELECT table_schema, table_name, column_name, data_type, is_nullable
            FROM ${cat}.information_schema.columns
            WHERE table_schema != 'information_schema'
            ORDER BY table_schema, table_name, ordinal_position
          `);

          let columnsColumns = columnsResult.columns;
          let columnsRows = columnsResult.data.map(r => {
            let dRow: { [name: string]: any } = {};
            columnsColumns.forEach((column: any, index: number) => {
              dRow[column.name as string] = r[index];
            });
            return dRow;
          });

          let schemaPrefix = catalogDiscovered ? `${cat}.` : '';

          tablesRows.forEach(row => {
            row.table_schema = `${schemaPrefix}${row.table_schema}`;
            allTablesRows.push(row);
          });

          columnsRows.forEach(row => {
            row.table_schema = `${schemaPrefix}${row.table_schema}`;
            allColumnsRows.push(row);
          });
        } catch (e: any) {
          logToConsoleBackend({
            log: `Presto fetchSchema skipping catalog "${cat}": ${e.message}`,
            logLevel: LogLevelEnum.Info,
            logger: this.logger,
            cs: this.cs
          });
        }
      });

      let tables: RawSchemaTable[] = allTablesRows.map(row => {
        let columns: RawSchemaColumn[] = allColumnsRows
          .filter(
            c =>
              c.table_schema === row.table_schema &&
              c.table_name === row.table_name
          )
          .map(c => ({
            columnName: c.column_name,
            dataType: c.data_type,
            isNullable: c.is_nullable === 'YES',
            foreignKeys: [] as RawSchemaColumn['foreignKeys']
          }));

        return {
          schemaName: row.table_schema,
          tableName: row.table_name,
          tableType: row.table_type,
          columns: columns,
          indexes: [] as RawSchemaIndex[]
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

    let prestoClientConfig = this.optionsToPrestoClientConfig({
      connection: connection
    });

    let pc = new PrestoClient(prestoClientConfig);

    await pc
      .query(querySql)
      .then(async (result: PrestoQuery) => {
        let columns = result.columns;

        let data = result.data.map(r => {
          let dRow: { [name: string]: any } = {};

          columns.forEach((column: any, index: number) => {
            dRow[column.name as string] = r[index];
          });

          return dRow;
        });

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
        this.processPrestoError({
          e: e,
          queryId: queryId,
          queryJobId: queryJobId,
          projectId: projectId
        })
      );
  }

  async processPrestoError(item: {
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
      q.lastErrorMessage = e.cause?.message ?? e.message; // presto specific
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
