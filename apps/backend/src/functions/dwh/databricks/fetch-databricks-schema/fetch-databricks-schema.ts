import { DBSQLClient } from '@databricks/sql';
import type IDBSQLSession from '@databricks/sql/dist/contracts/IDBSQLSession';
import type IOperation from '@databricks/sql/dist/contracts/IOperation';
import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { buildDatabricksConnectOptions } from '#backend/functions/dwh/databricks/build-databricks-connect-options/build-databricks-connect-options';
import {
  type OptionsToDatabricksConfigOutput,
  optionsToDatabricksConfig
} from '#backend/functions/dwh/databricks/options-to-databricks-config/options-to-databricks-config';
import { quietLogger } from '#backend/functions/dwh/databricks/quiet-logger';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ServerError } from '#common/classes/server-error/server-error';
import type { ConnectionRawSchema } from '#common/types/backend/parts/connection-schemas/raw-schemas/connection-raw-schema';
import type { RawSchemaColumn } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-column';
import type { RawSchemaForeignKey } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-foreign-key';
import type { RawSchemaIndex } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-index';
import type { RawSchemaTable } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-table';

export async function fetchDatabricksSchema(item: {
  connection: ConnectionTab;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}): Promise<ConnectionRawSchema> {
  let { connection, cs, logger } = item;

  let config: OptionsToDatabricksConfigOutput = optionsToDatabricksConfig({
    connection: connection
  });

  let client: DBSQLClient = new DBSQLClient({ logger: quietLogger });

  try {
    await client.connect(buildDatabricksConnectOptions({ config: config }));

    let session: IDBSQLSession = await client.openSession();

    let tablesOperation: IOperation = await session.executeStatement(
      `
      SELECT table_schema, table_name, table_type
      FROM information_schema.tables
      WHERE table_catalog = '${config.defaultCatalog}'
        AND table_schema != 'information_schema'

      ORDER BY table_schema, table_name
      `,
      { runAsync: true }
    );

    let tablesRows: {
      table_schema: string;
      table_name: string;
      table_type: string;
    }[] = (await tablesOperation.fetchAll()) as {
      table_schema: string;
      table_name: string;
      table_type: string;
    }[];

    await tablesOperation.close();

    let columnsOperation: IOperation = await session.executeStatement(
      `
      SELECT table_schema, table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_catalog = '${config.defaultCatalog}'
        AND table_schema != 'information_schema'
      ORDER BY table_schema, table_name, ordinal_position
      `,
      { runAsync: true }
    );

    let columnsRows: {
      table_schema: string;
      table_name: string;
      column_name: string;
      data_type: string;
      is_nullable: string;
    }[] = (await columnsOperation.fetchAll()) as {
      table_schema: string;
      table_name: string;
      column_name: string;
      data_type: string;
      is_nullable: string;
    }[];

    await columnsOperation.close();

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
      let fkOperation: IOperation = await session.executeStatement(
        `
        SELECT
          kcu.table_schema,
          kcu.table_name,
          kcu.column_name,
          tc.constraint_name,
          ccu.table_schema AS referenced_schema,
          ccu.table_name AS referenced_table,
          ccu.column_name AS referenced_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON kcu.constraint_name = tc.constraint_name
          AND kcu.constraint_schema = tc.constraint_schema
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.constraint_schema = tc.constraint_schema
        WHERE tc.table_catalog = '${config.defaultCatalog}'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema != 'information_schema'
        `,
        { runAsync: true }
      );

      fkRows = (await fkOperation.fetchAll()) as typeof fkRows;

      await fkOperation.close();
    } catch (fkErr: any) {
      logToConsoleBackend({
        log: new ServerError({
          message: 'BACKEND_FETCH_FK_DATABRICKS_ERROR',
          originalError: fkErr
        }),
        logLevel: 'Error',
        logger: logger,
        cs: cs
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
      let constraintOperation: IOperation = await session.executeStatement(
        `
        SELECT
          tc.table_schema,
          tc.table_name,
          kcu.column_name,
          tc.constraint_name,
          tc.constraint_type
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON kcu.constraint_name = tc.constraint_name
          AND kcu.constraint_schema = tc.constraint_schema
        WHERE tc.table_catalog = '${config.defaultCatalog}'
          AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
          AND tc.table_schema != 'information_schema'
        `,
        { runAsync: true }
      );

      constraintRows =
        (await constraintOperation.fetchAll()) as typeof constraintRows;

      await constraintOperation.close();
    } catch (constraintErr: any) {
      logToConsoleBackend({
        log: new ServerError({
          message: 'BACKEND_FETCH_CONSTRAINTS_DATABRICKS_ERROR',
          originalError: constraintErr
        }),
        logLevel: 'Error',
        logger: logger,
        cs: cs
      });
    }

    await session.close();

    let tables: RawSchemaTable[] = tablesRows.map(row => {
      let tableConstraintRows: {
        table_schema: string;
        table_name: string;
        column_name: string;
        constraint_name: string;
        constraint_type: string;
      }[] = constraintRows.filter(
        cr =>
          cr.table_schema === row.table_schema &&
          cr.table_name === row.table_name
      );

      let constraintNames = [
        ...new Set(tableConstraintRows.map(cr => cr.constraint_name))
      ];

      let indexes: RawSchemaIndex[] = constraintNames.map(constraintName => {
        let constraintGroup: {
          table_schema: string;
          table_name: string;
          column_name: string;
          constraint_name: string;
          constraint_type: string;
        }[] = tableConstraintRows.filter(
          cr => cr.constraint_name === constraintName
        );

        let isPrimaryKey = constraintGroup[0].constraint_type === 'PRIMARY KEY';

        return {
          indexName: constraintName,
          indexColumns: constraintGroup.map(cr => cr.column_name),
          isUnique: true,
          isPrimaryKey: isPrimaryKey
        };
      });

      let columns: RawSchemaColumn[] = columnsRows
        .filter(
          c =>
            c.table_schema === row.table_schema &&
            c.table_name === row.table_name
        )
        .map(c => {
          let foreignKeys: RawSchemaForeignKey[] = fkRows
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

          let isPrimaryKey: boolean = indexes.some(
            idx =>
              idx.isPrimaryKey === true &&
              idx.indexColumns.includes(c.column_name)
          );

          let isUnique: boolean = indexes.some(
            idx =>
              idx.isUnique === true && idx.indexColumns.includes(c.column_name)
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
  } finally {
    try {
      await client.close();
    } catch (err: any) {
      logToConsoleBackend({
        log: new ServerError({
          message: 'BACKEND_DATABRICKS_FAILED_TO_CLOSE_CONNECTION',
          originalError: err
        }),
        logLevel: 'Error',
        logger: logger,
        cs: cs
      });
    }
  }
}
