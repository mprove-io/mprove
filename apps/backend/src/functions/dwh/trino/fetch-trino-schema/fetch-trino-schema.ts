import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import pIteration from 'p-iteration';
import {
  type ConnectionOptions,
  type QueryResult,
  Trino,
  type Iterator as TrinoIterator
} from 'trino-client';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { optionsToTrinoOptions } from '#backend/functions/dwh/trino/options-to-trino-options/options-to-trino-options';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ConnectionRawSchema } from '#common/types/backend/parts/connection-schemas/raw-schemas/connection-raw-schema';
import type { RawSchemaColumn } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-column';
import type { RawSchemaIndex } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-index';
import type { RawSchemaTable } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-table';

const { forEachSeries } = pIteration;

export async function fetchTrinoSchema(item: {
  connection: ConnectionTab;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}): Promise<ConnectionRawSchema> {
  let { connection, cs, logger } = item;

  let trinoConnectionOptions: ConnectionOptions = optionsToTrinoOptions({
    connection: connection
  });

  try {
    let tc: Trino = Trino.create(trinoConnectionOptions);

    let catalog = connection.options.trino.catalog;

    let catalogs: string[];

    let catalogDiscovered = false;

    if (isDefinedAndNotEmpty(catalog)) {
      catalogs = [catalog];
    } else {
      catalogDiscovered = true;

      let catalogsResult: TrinoIterator<QueryResult> =
        await tc.query('SHOW CATALOGS');

      let catalogsQueryResult: IteratorResult<QueryResult, any> =
        await catalogsResult.next();

      if (
        isUndefined(catalogsQueryResult?.value) ||
        isDefined(catalogsQueryResult?.value?.error)
      ) {
        let errorMsg = isUndefined(catalogsQueryResult?.value)
          ? 'catalogsQueryResult.value is not defined'
          : catalogsQueryResult?.value?.error?.message;

        let connectionRawSchema: ConnectionRawSchema = {
          tables: [],
          lastRefreshedTs: Date.now(),
          errorMessage: `Schema fetch failed: ${errorMsg}`
        };

        return connectionRawSchema;
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

    await forEachSeries(catalogs, async (cat: string): Promise<void> => {
      try {
        let tablesResult: TrinoIterator<QueryResult> = await tc.query(`
          SELECT table_schema, table_name, table_type
          FROM ${cat}.information_schema.tables
          WHERE table_schema != 'information_schema'
          ORDER BY table_schema, table_name
        `);

        let tablesQueryResult: IteratorResult<QueryResult, any> =
          await tablesResult.next();

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

        let tablesRows: { [name: string]: any }[] = tablesOutputRows.map(r => {
          let dRow: { [name: string]: any } = {};

          tablesColumns.forEach((column: any, index: number) => {
            dRow[column.name as string] = r[index];
          });

          return dRow;
        });

        let columnsResult: TrinoIterator<QueryResult> = await tc.query(`
          SELECT table_schema, table_name, column_name, data_type, is_nullable
          FROM ${cat}.information_schema.columns
          WHERE table_schema != 'information_schema'
          ORDER BY table_schema, table_name, ordinal_position
        `);

        let columnsQueryResult: IteratorResult<QueryResult, any> =
          await columnsResult.next();

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

        let columnsRows: { [name: string]: any }[] = columnsOutputRows.map(
          r => {
            let dRow: { [name: string]: any } = {};

            columnsColumns.forEach((column: any, index: number) => {
              dRow[column.name as string] = r[index];
            });

            return dRow;
          }
        );

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
          logLevel: 'Info',
          logger: logger,
          cs: cs
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

    let connectionRawSchema: ConnectionRawSchema = {
      tables: tables,
      lastRefreshedTs: Date.now(),
      errorMessage: undefined
    };

    return connectionRawSchema;
  } catch (err: any) {
    let connectionRawSchema: ConnectionRawSchema = {
      tables: [],
      lastRefreshedTs: Date.now(),
      errorMessage: `Schema fetch failed: ${err.message}`
    };

    return connectionRawSchema;
  }
}
