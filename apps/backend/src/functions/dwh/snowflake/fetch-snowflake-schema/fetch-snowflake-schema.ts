import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import snowflake from 'snowflake-sdk';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { optionsToSnowflakeOptions } from '#backend/functions/dwh/snowflake/options-to-snowflake-options/options-to-snowflake-options';
import { snowflakeConnectionExecute } from '#backend/functions/dwh/snowflake/snowflake-connection-execute/snowflake-connection-execute';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ServerError } from '#common/classes/server-error/server-error';
import type { ConnectionRawSchema } from '#common/types/backend/parts/connection-schemas/raw-schemas/connection-raw-schema';
import type { RawSchemaColumn } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-column';
import type { RawSchemaForeignKey } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-foreign-key';
import type { RawSchemaIndex } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-index';
import type { RawSchemaTable } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-table';

export async function fetchSnowflakeSchema(item: {
  connection: ConnectionTab;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}): Promise<ConnectionRawSchema> {
  let { connection, cs, logger } = item;

  let snoflakeOptions: snowflake.ConnectionOptions = optionsToSnowflakeOptions({
    connection: connection
  });

  let snowflakeConnection: snowflake.Connection =
    snowflake.createConnection(snoflakeOptions);

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

    let tablesResult: any = await snowflakeConnectionExecute({
      sfConnection: snowflakeConnection,
      execOptions: {
        sqlText: `
          SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA != 'INFORMATION_SCHEMA'
            AND TABLE_TYPE NOT IN ('TEMPORARY TABLE')
          ORDER BY TABLE_SCHEMA, TABLE_NAME
        `
      }
    });

    let tablesRows = tablesResult.rows as {
      TABLE_SCHEMA: string;
      TABLE_NAME: string;
      TABLE_TYPE: string;
    }[];

    let columnsResult: any = await snowflakeConnectionExecute({
      sfConnection: snowflakeConnection,
      execOptions: {
        sqlText: `
          SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE,
                 NUMERIC_PRECISION, NUMERIC_SCALE
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA != 'INFORMATION_SCHEMA'
          ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION
        `
      }
    });

    let columnsRows = columnsResult.rows as {
      TABLE_SCHEMA: string;
      TABLE_NAME: string;
      COLUMN_NAME: string;
      DATA_TYPE: string;
      IS_NULLABLE: string;
      NUMERIC_PRECISION?: number;
      NUMERIC_SCALE?: number;
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
      let fkResult: any = await snowflakeConnectionExecute({
        sfConnection: snowflakeConnection,
        execOptions: {
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
      });

      fkRows = fkResult.rows as typeof fkRows;
    } catch (fkErr: any) {
      logToConsoleBackend({
        log: new ServerError({
          message: 'BACKEND_FETCH_FK_SNOWFLAKE_ERROR',
          originalError: fkErr
        }),
        logLevel: 'Error',
        logger: logger,
        cs: cs
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
      let constraintResult: any = await snowflakeConnectionExecute({
        sfConnection: snowflakeConnection,
        execOptions: {
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
      });

      constraintRows = constraintResult.rows as typeof constraintRows;
    } catch (constraintErr: any) {
      logToConsoleBackend({
        log: new ServerError({
          message: 'BACKEND_FETCH_CONSTRAINTS_SNOWFLAKE_ERROR',
          originalError: constraintErr
        }),
        logLevel: 'Error',
        logger: logger,
        cs: cs
      });
    }

    let tables: RawSchemaTable[] = tablesRows.map(row => {
      let tableConstraintRows: {
        TABLE_SCHEMA: string;
        TABLE_NAME: string;
        COLUMN_NAME: string;
        CONSTRAINT_NAME: string;
        CONSTRAINT_TYPE: string;
      }[] = constraintRows.filter(
        cr =>
          cr.TABLE_SCHEMA === row.TABLE_SCHEMA &&
          cr.TABLE_NAME === row.TABLE_NAME
      );

      let constraintNames = [
        ...new Set(tableConstraintRows.map(cr => cr.CONSTRAINT_NAME))
      ];

      let indexes: RawSchemaIndex[] = constraintNames.map(constraintName => {
        let constraintGroup: {
          TABLE_SCHEMA: string;
          TABLE_NAME: string;
          COLUMN_NAME: string;
          CONSTRAINT_NAME: string;
          CONSTRAINT_TYPE: string;
        }[] = tableConstraintRows.filter(
          cr => cr.CONSTRAINT_NAME === constraintName
        );

        let isPrimaryKey = constraintGroup[0].CONSTRAINT_TYPE === 'PRIMARY KEY';

        return {
          indexName: constraintName,
          indexColumns: constraintGroup.map(cr => cr.COLUMN_NAME),
          isUnique: true,
          isPrimaryKey: isPrimaryKey
        };
      });

      let columns: RawSchemaColumn[] = columnsRows
        .filter(
          c =>
            c.TABLE_SCHEMA === row.TABLE_SCHEMA &&
            c.TABLE_NAME === row.TABLE_NAME
        )
        .map(c => {
          let foreignKeys: RawSchemaForeignKey[] = fkRows
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

          let isPrimaryKey: boolean = indexes.some(
            idx =>
              idx.isPrimaryKey === true &&
              idx.indexColumns.includes(c.COLUMN_NAME)
          );

          let isUnique: boolean = indexes.some(
            idx =>
              idx.isUnique === true && idx.indexColumns.includes(c.COLUMN_NAME)
          );

          let dataType = c.DATA_TYPE;

          let isNumericType: boolean = [
            'NUMBER',
            'NUMERIC',
            'DECIMAL'
          ].includes(dataType);

          if (isNumericType && c.NUMERIC_PRECISION !== null) {
            dataType = `${dataType}(${c.NUMERIC_PRECISION},${c.NUMERIC_SCALE ?? 0})`;
          }

          return {
            columnName: c.COLUMN_NAME,
            dataType: dataType,
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
    snowflakeConnection.destroy(destroyErr => {
      if (destroyErr) {
        logToConsoleBackend({
          log: new ServerError({
            message: 'BACKEND_SNOWFLAKE_FAILED_TO_DESTROY_CONNECTION',
            originalError: destroyErr
          }),
          logLevel: 'Error',
          logger: logger,
          cs: cs
        });
      }
    });
  }
}
