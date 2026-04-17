import { TrinoConnectionConfiguration } from '@malloydata/db-trino/dist/trino_connection';
import type { ConnectionConfigEntry } from '@malloydata/malloy';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import pIteration from 'p-iteration';
import { BasicAuth, ConnectionOptions, Trino } from 'trino-client';
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
import { isUndefined } from '#common/functions/is-undefined';
import type {
  ConnectionRawSchema,
  RawSchemaColumn,
  RawSchemaIndex,
  RawSchemaTable
} from '#common/zod/backend/connection-schemas/raw-schema';
import type { MalloyConfigPart } from '#common/zod/backend/malloy-config-part';
import type { FetchSampleResult } from '#common/zod/to-backend/connections/fetch-sample-result';
import type { TestConnectionResult } from '#common/zod/to-backend/connections/to-backend-test-connection';
import { TabService } from '../tab.service';

const { forEachSeries } = pIteration;

@Injectable()
export class TrinoService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  makeMalloyConfigPart(item: {
    connection: ConnectionTab;
    envPrefix: string;
  }): MalloyConfigPart {
    let { connection, envPrefix } = item;
    let opts = connection.options.trino;
    let envs: Record<string, string> = {};
    let files: { path: string; data: string }[] = [];

    if (isDefined(opts.server)) {
      envs[`${envPrefix}_SERVER`] = String(opts.server);
    }
    if (isDefined(opts.catalog)) {
      envs[`${envPrefix}_CATALOG`] = String(opts.catalog);
    }
    if (isDefined(opts.schema)) {
      envs[`${envPrefix}_SCHEMA`] = String(opts.schema);
    }
    if (isDefined(opts.user)) {
      envs[`${envPrefix}_USER`] = String(opts.user);
    }
    if (isDefined(opts.password)) {
      envs[`${envPrefix}_PASSWORD`] = String(opts.password);
    }

    let malloyConnectionConfigEntry: ConnectionConfigEntry = {
      is: 'trino',
      server: { env: `${envPrefix}_SERVER` },
      catalog: { env: `${envPrefix}_CATALOG` },
      schema: { env: `${envPrefix}_SCHEMA` },
      user: { env: `${envPrefix}_USER` },
      password: { env: `${envPrefix}_PASSWORD` }
    };

    return {
      malloyConnectionConfigEntry: malloyConnectionConfigEntry,
      envs: envs,
      files: files
    };
  }

  optionsToTrinoOptions(item: { connection: ConnectionTab }) {
    let { connection } = item;

    let prepConnectionOptions: TrinoConnectionConfiguration = {
      server:
        connection.options.trino.internalServer ||
        connection.options.trino.server,
      catalog: connection.options.trino.catalog,
      schema: connection.options.trino.schema,
      user: connection.options.trino.user,
      password: connection.options.trino.password,
      extraConfig: connection.options.trino.extraConfig
    };

    let connectionOptions = {
      server: prepConnectionOptions.server,
      catalog: prepConnectionOptions.catalog,
      schema: prepConnectionOptions.schema,
      auth: new BasicAuth(
        prepConnectionOptions.user,
        prepConnectionOptions.password
      ),
      ...(prepConnectionOptions.extraConfig as Partial<ConnectionOptions>)
    };

    return connectionOptions;
  }

  async testConnection(item: {
    connection: ConnectionTab;
  }): Promise<TestConnectionResult> {
    let { connection } = item;

    let trinoConnectionOptions = this.optionsToTrinoOptions({
      connection: connection
    });

    try {
      let tc = Trino.create(trinoConnectionOptions);

      await tc.query('SELECT 1');

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

    let trinoConnectionOptions = this.optionsToTrinoOptions({
      connection: connection
    });

    try {
      let tc = Trino.create(trinoConnectionOptions);

      let catalog = connection.options.trino.catalog;

      let sqlText: string;

      if (isDefined(columnName)) {
        sqlText = `SELECT DISTINCT "${columnName}" FROM (SELECT "${columnName}" FROM "${catalog}"."${schemaName}"."${tableName}" LIMIT 10000) sub LIMIT 100`;
      } else {
        let sqlOffset = isDefined(offset) ? offset : 0;
        sqlText = `SELECT * FROM "${catalog}"."${schemaName}"."${tableName}" OFFSET ${sqlOffset} LIMIT 100`;
      }

      let result = await tc.query(sqlText);
      let queryResult = await result.next();

      if (
        isUndefined(queryResult?.value) ||
        isDefined(queryResult?.value?.error)
      ) {
        let errorMsg = isUndefined(queryResult?.value)
          ? 'queryResult.value is not defined'
          : queryResult?.value?.error?.message;
        return {
          columnNames: [],
          rows: [],
          errorMessage: `Sample fetch failed: ${errorMsg}`
        };
      }

      let trinoColumns = queryResult.value.columns;
      let outputRows: unknown[][] = [];

      while (queryResult !== null) {
        let dataRows = queryResult.value.data ?? [];
        dataRows.forEach((row: any) => {
          outputRows.push(row as unknown[]);
        });
        if (!queryResult.done) {
          queryResult = await result.next();
        } else {
          break;
        }
      }

      let resultRows = outputRows.map(r => {
        let dRow: { [name: string]: any } = {};
        trinoColumns.forEach((column: any, index: number) => {
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

    let trinoConnectionOptions = this.optionsToTrinoOptions({
      connection: connection
    });

    try {
      let tc = Trino.create(trinoConnectionOptions);

      let catalog = connection.options.trino.catalog;
      let catalogs: string[];
      let catalogDiscovered = false;

      if (isDefinedAndNotEmpty(catalog)) {
        catalogs = [catalog];
      } else {
        catalogDiscovered = true;
        let catalogsResult = await tc.query('SHOW CATALOGS');
        let catalogsQueryResult = await catalogsResult.next();

        if (
          isUndefined(catalogsQueryResult?.value) ||
          isDefined(catalogsQueryResult?.value?.error)
        ) {
          let errorMsg = isUndefined(catalogsQueryResult?.value)
            ? 'catalogsQueryResult.value is not defined'
            : catalogsQueryResult?.value?.error?.message;
          return {
            tables: [],
            lastRefreshedTs: Date.now(),
            errorMessage: `Schema fetch failed: ${errorMsg}`
          };
        }

        let catalogsOutputRows: unknown[][] = [];

        while (catalogsQueryResult !== null) {
          let rows = catalogsQueryResult.value.data ?? [];
          rows.forEach((row: any) => {
            catalogsOutputRows.push(row as unknown[]);
          });
          if (!catalogsQueryResult.done) {
            catalogsQueryResult = await catalogsResult.next();
          } else {
            break;
          }
        }

        catalogs = catalogsOutputRows
          .map(r => r[0] as string)
          .filter(c => c !== 'system');
      }

      let allTablesRows: { [name: string]: any }[] = [];
      let allColumnsRows: { [name: string]: any }[] = [];

      await forEachSeries(catalogs, async cat => {
        try {
          let tablesResult = await tc.query(`
            SELECT table_schema, table_name, table_type
            FROM ${cat}.information_schema.tables
            WHERE table_schema != 'information_schema'
            ORDER BY table_schema, table_name
          `);

          let tablesQueryResult = await tablesResult.next();

          if (
            isUndefined(tablesQueryResult?.value) ||
            isDefined(tablesQueryResult?.value?.error)
          ) {
            return;
          }

          let tablesColumns = tablesQueryResult.value.columns;
          let tablesOutputRows: unknown[][] = [];

          while (tablesQueryResult !== null) {
            let rows = tablesQueryResult.value.data ?? [];
            rows.forEach((row: any) => {
              tablesOutputRows.push(row as unknown[]);
            });
            if (!tablesQueryResult.done) {
              tablesQueryResult = await tablesResult.next();
            } else {
              break;
            }
          }

          let tablesRows = tablesOutputRows.map(r => {
            let dRow: { [name: string]: any } = {};
            tablesColumns.forEach((column: any, index: number) => {
              dRow[column.name as string] = r[index];
            });
            return dRow;
          });

          let columnsResult = await tc.query(`
            SELECT table_schema, table_name, column_name, data_type, is_nullable
            FROM ${cat}.information_schema.columns
            WHERE table_schema != 'information_schema'
            ORDER BY table_schema, table_name, ordinal_position
          `);

          let columnsQueryResult = await columnsResult.next();

          if (
            isUndefined(columnsQueryResult?.value) ||
            isDefined(columnsQueryResult?.value?.error)
          ) {
            return;
          }

          let columnsColumns = columnsQueryResult.value.columns;
          let columnsOutputRows: unknown[][] = [];

          while (columnsQueryResult !== null) {
            let rows = columnsQueryResult.value.data ?? [];
            rows.forEach((row: any) => {
              columnsOutputRows.push(row as unknown[]);
            });
            if (!columnsQueryResult.done) {
              columnsQueryResult = await columnsResult.next();
            } else {
              break;
            }
          }

          let columnsRows = columnsOutputRows.map(r => {
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
            log: `Trino fetchSchema skipping catalog "${cat}": ${e.message}`,
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

    let trinoConnectionOptions = this.optionsToTrinoOptions({
      connection: connection
    });

    let tc = Trino.create(trinoConnectionOptions);

    await tc
      .query(querySql)
      .then(async result => {
        let queryResult = await result.next();

        let q = await this.db.drizzle.query.queriesTable
          .findFirst({
            where: and(
              eq(queriesTable.queryId, queryId),
              eq(queriesTable.queryJobId, queryJobId),
              eq(queriesTable.projectId, projectId)
            )
          })
          .then(x => this.tabService.queryEntToTab(x));

        if (isDefined(q) || isUndefined(queryResult?.value)) {
          if (
            isUndefined(queryResult?.value) ||
            isDefined(queryResult?.value?.error)
          ) {
            q.status = QueryStatusEnum.Error;
            q.data = [];
            q.queryJobId = undefined;
            q.lastErrorMessage = isUndefined(queryResult?.value)
              ? 'queryResult.value is not defined'
              : queryResult?.value?.error?.message;
            q.lastErrorTs = makeTsNumber();
          } else {
            let columns = queryResult.value.columns;

            let outputRows: unknown[][] = [];

            while (queryResult !== null) {
              let rows = queryResult.value.data ?? [];
              rows.forEach((row: any) => {
                outputRows.push(row as unknown[]);
              });
              if (!queryResult.done) {
                queryResult = await result.next();
              } else {
                break;
              }
            }

            let data = outputRows.map(r => {
              let dRow: { [name: string]: any } = {};

              columns.forEach((column: any, index: number) => {
                dRow[column.name as string] = r[index];
              });

              return dRow;
            });

            q.status = QueryStatusEnum.Completed;
            q.queryJobId = undefined;
            q.data = data;
            q.lastCompleteTs = makeTsNumber();
            q.lastCompleteDuration = Math.floor(
              (Number(q.lastCompleteTs) - Number(q.lastRunTs)) / 1000
            );
          }

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
