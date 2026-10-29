import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type {
  PrestoClientConfig,
  PrestoQuery
} from '@prestodb/presto-js-client';
import pIteration from 'p-iteration';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { optionsToPrestoClientConfig } from '#backend/functions/dwh/presto/options-to-presto-client-config/options-to-presto-client-config';
import { PrestoClient } from '#backend/functions/dwh/presto/presto-client';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import type { ConnectionRawSchema } from '#common/types/backend/parts/connection-schemas/raw-schemas/connection-raw-schema';
import type { RawSchemaColumn } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-column';
import type { RawSchemaIndex } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-index';
import type { RawSchemaTable } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-table';

const { forEachSeries } = pIteration;

export async function fetchPrestoSchema(item: {
  connection: ConnectionTab;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}): Promise<ConnectionRawSchema> {
  let { connection, cs, logger } = item;

  let prestoClientConfig: PrestoClientConfig = optionsToPrestoClientConfig({
    connection: connection
  });

  try {
    let pc: InstanceType<typeof PrestoClient> = new PrestoClient(
      prestoClientConfig
    );

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

    await forEachSeries(catalogs, async (cat: string): Promise<void> => {
      try {
        let tablesResult: PrestoQuery = await pc.query(`
          SELECT table_schema, table_name, table_type
          FROM ${cat}.information_schema.tables
          WHERE table_schema != 'information_schema'
          ORDER BY table_schema, table_name
        `);

        let tablesColumns = tablesResult.columns;

        let tablesRows: { [name: string]: any }[] = tablesResult.data.map(r => {
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

        let columnsRows: { [name: string]: any }[] = columnsResult.data.map(
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
          log: `Presto fetchSchema skipping catalog "${cat}": ${e.message}`,
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
