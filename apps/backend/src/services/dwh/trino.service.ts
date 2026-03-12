import { TrinoConnectionConfiguration } from '@malloydata/db-trino/dist/trino_connection';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import { BasicAuth, Trino } from 'trino-client';
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
import {
  ConnectionSchema,
  SchemaColumn,
  SchemaIndex,
  SchemaTable
} from '#common/interfaces/backend/connection-schema';
import { TestConnectionResult } from '#common/interfaces/to-backend/connections/to-backend-test-connection';
import { TabService } from '../tab.service';

@Injectable()
export class TrinoService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  optionsToTrinoOptions(item: { connection: ConnectionTab }) {
    let { connection } = item;

    let prepConnectionOptions: TrinoConnectionConfiguration = {
      server: connection.options.trino.server,
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
      ...prepConnectionOptions.extraConfig
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

  async fetchSchema(item: {
    connection: ConnectionTab;
  }): Promise<ConnectionSchema> {
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
          for (let row of rows) {
            catalogsOutputRows.push(row as unknown[]);
          }
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

      for (let cat of catalogs) {
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
            continue;
          }

          let tablesColumns = tablesQueryResult.value.columns;
          let tablesOutputRows: unknown[][] = [];

          while (tablesQueryResult !== null) {
            let rows = tablesQueryResult.value.data ?? [];
            for (let row of rows) {
              tablesOutputRows.push(row as unknown[]);
            }
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
            continue;
          }

          let columnsColumns = columnsQueryResult.value.columns;
          let columnsOutputRows: unknown[][] = [];

          while (columnsQueryResult !== null) {
            let rows = columnsQueryResult.value.data ?? [];
            for (let row of rows) {
              columnsOutputRows.push(row as unknown[]);
            }
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

          for (let row of tablesRows) {
            row.table_schema = `${schemaPrefix}${row.table_schema}`;
            allTablesRows.push(row);
          }

          for (let row of columnsRows) {
            row.table_schema = `${schemaPrefix}${row.table_schema}`;
            allColumnsRows.push(row);
          }
        } catch (e: any) {
          logToConsoleBackend({
            log: `Trino fetchSchema skipping catalog "${cat}": ${e.message}`,
            logLevel: LogLevelEnum.Info,
            logger: this.logger,
            cs: this.cs
          });
        }
      }

      let tables: SchemaTable[] = allTablesRows.map(row => {
        let columns: SchemaColumn[] = allColumnsRows
          .filter(
            c =>
              c.table_schema === row.table_schema &&
              c.table_name === row.table_name
          )
          .map(c => ({
            columnName: c.column_name,
            dataType: c.data_type,
            isNullable: c.is_nullable === 'YES',
            foreignKeys: [] as SchemaColumn['foreignKeys']
          }));

        return {
          schemaName: row.table_schema,
          tableName: row.table_name,
          tableType: row.table_type,
          columns: columns,
          indexes: [] as SchemaIndex[]
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
              for (let row of rows) {
                outputRows.push(row as unknown[]);
              }
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
