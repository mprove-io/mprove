import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import * as MYSQL from 'mysql2/promise';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { optionsToMysqlOptions } from '#backend/functions/dwh/mysql/options-to-mysql-options/options-to-mysql-options';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ConnectionRawSchema } from '#common/types/backend/parts/connection-schemas/raw-schemas/connection-raw-schema';
import type { RawSchemaColumn } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-column';
import type { RawSchemaForeignKey } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-foreign-key';
import type { RawSchemaIndex } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-index';
import type { RawSchemaTable } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-table';

export async function fetchMysqlSchema(item: {
  connection: ConnectionTab;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}): Promise<ConnectionRawSchema> {
  let { connection, cs, logger } = item;

  let mysqlConnectionOptions: MYSQL.ConnectionOptions = optionsToMysqlOptions({
    connection: connection
  });

  let mc: MYSQL.Connection;

  try {
    mc = await MYSQL.createConnection(mysqlConnectionOptions);

    let [tablesResult]: [MYSQL.QueryResult, MYSQL.FieldPacket[]] =
      await mc.query(`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
      ORDER BY table_name
    `);

    let tablesRows = tablesResult as {
      TABLE_NAME: string;
      TABLE_TYPE: string;
    }[];

    let [columnsResult]: [MYSQL.QueryResult, MYSQL.FieldPacket[]] =
      await mc.query(`
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

    let [indexesResult]: [MYSQL.QueryResult, MYSQL.FieldPacket[]] =
      await mc.query(`
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

    let fkRows: {
      TABLE_NAME: string;
      COLUMN_NAME: string;
      CONSTRAINT_NAME: string;
      REFERENCED_TABLE_SCHEMA: string;
      REFERENCED_TABLE_NAME: string;
      REFERENCED_COLUMN_NAME: string;
    }[] = [];

    try {
      let [fkResult]: [MYSQL.QueryResult, MYSQL.FieldPacket[]] =
        await mc.query(`
        SELECT
          kcu.TABLE_NAME,
          kcu.COLUMN_NAME,
          kcu.CONSTRAINT_NAME,
          kcu.REFERENCED_TABLE_SCHEMA,
          kcu.REFERENCED_TABLE_NAME,
          kcu.REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE kcu
        WHERE kcu.TABLE_SCHEMA = DATABASE()
          AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
        ORDER BY kcu.TABLE_NAME, kcu.COLUMN_NAME
      `);

      fkRows = fkResult as typeof fkRows;
    } catch (fkErr: any) {
      logToConsoleBackend({
        log: new ServerError({
          message: 'BACKEND_FETCH_FK_MYSQL_ERROR',
          originalError: fkErr
        }),
        logLevel: 'Error',
        logger: logger,
        cs: cs
      });
    }

    let tables: RawSchemaTable[] = tablesRows.map(row => {
      let tableName = row.TABLE_NAME;

      let indexes: RawSchemaIndex[] = indexesRows
        .filter(ix => ix.TABLE_NAME === tableName)
        .map(ix => {
          let colsStr = ix.index_columns || '';

          let indexColumns: string[] = colsStr
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

      let columns: RawSchemaColumn[] = columnsRows
        .filter(c => c.TABLE_NAME === tableName)
        .map(c => {
          let foreignKeys: RawSchemaForeignKey[] = fkRows
            .filter(
              fk =>
                fk.TABLE_NAME === tableName && fk.COLUMN_NAME === c.COLUMN_NAME
            )
            .map(fk => ({
              constraintName: fk.CONSTRAINT_NAME,
              referencedSchemaName: fk.REFERENCED_TABLE_SCHEMA,
              referencedTableName: fk.REFERENCED_TABLE_NAME,
              referencedColumnName: fk.REFERENCED_COLUMN_NAME
            }));

          let isPrimaryKey: boolean = indexes.some(
            idx =>
              idx.isPrimaryKey === true &&
              idx.indexColumns.includes(c.COLUMN_NAME)
          );

          let isUnique: boolean = indexes.some(
            idx =>
              idx.isUnique === true && idx.indexColumns.includes(c.COLUMN_NAME)
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
        schemaName: connection.options.mysql.database,
        tableName: tableName,
        tableType: row.TABLE_TYPE,
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
    if (isDefined(mc)) {
      mc.end().catch(er => {
        logToConsoleBackend({
          log: new ServerError({
            message: 'BACKEND_MYSQL_CONNECTION_CLOSE_ERROR',
            originalError: er
          }),
          logLevel: 'Error',
          logger: logger,
          cs: cs
        });
      });
    }
  }
}
