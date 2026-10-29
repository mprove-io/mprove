import {
  BigQuery,
  type BigQueryOptions,
  type Dataset,
  type DatasetsResponse,
  type QueryRowsResponse
} from '@google-cloud/bigquery';
import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import pIteration from 'p-iteration';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { optionsToBigqueryOptions } from '#backend/functions/dwh/bigquery/options-to-bigquery-options/options-to-bigquery-options';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ServerError } from '#common/classes/server-error/server-error';
import type { ConnectionRawSchema } from '#common/types/backend/parts/connection-schemas/raw-schemas/connection-raw-schema';
import type { RawSchemaColumn } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-column';
import type { RawSchemaForeignKey } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-foreign-key';
import type { RawSchemaIndex } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-index';
import type { RawSchemaTable } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-table';

const { forEachSeries } = pIteration;

export async function fetchBigquerySchema(item: {
  connection: ConnectionTab;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}): Promise<ConnectionRawSchema> {
  let { connection, cs, logger } = item;

  let bigqueryConnectionOptions: BigQueryOptions = optionsToBigqueryOptions({
    connection: connection
  });

  try {
    let bigquery: BigQuery = new BigQuery(bigqueryConnectionOptions);

    let [datasets]: DatasetsResponse = await bigquery.getDatasets();

    let allTablesRows: {
      table_schema: string;
      table_name: string;
      table_type: string;
    }[] = [];

    let allColumnsRows: {
      table_schema: string;
      table_name: string;
      column_name: string;
      data_type: string;
      is_nullable: string;
    }[] = [];

    let allFkRows: {
      table_schema: string;
      table_name: string;
      column_name: string;
      constraint_name: string;
      referenced_schema: string;
      referenced_table: string;
      referenced_column: string;
    }[] = [];

    let allConstraintRows: {
      table_schema: string;
      table_name: string;
      column_name: string;
      constraint_name: string;
      constraint_type: string;
    }[] = [];

    await forEachSeries(datasets, async (dataset: Dataset): Promise<void> => {
      let datasetId = dataset.id;

      try {
        let [tablesRows]: QueryRowsResponse = await bigquery.query(`
          SELECT table_schema, table_name, table_type
          FROM \`${datasetId}\`.INFORMATION_SCHEMA.TABLES

          ORDER BY table_schema, table_name
        `);

        allTablesRows.push(...tablesRows);

        let [columnsRows]: QueryRowsResponse = await bigquery.query(`
          SELECT table_schema, table_name, column_name, data_type, is_nullable
          FROM \`${datasetId}\`.INFORMATION_SCHEMA.COLUMNS
          ORDER BY table_schema, table_name, ordinal_position
        `);

        allColumnsRows.push(...columnsRows);

        try {
          let [fkRows]: QueryRowsResponse = await bigquery.query(`
            SELECT
              kcu.table_schema,
              kcu.table_name,
              kcu.column_name,
              tc.constraint_name,
              ccu.table_schema AS referenced_schema,
              ccu.table_name AS referenced_table,
              ccu.column_name AS referenced_column
            FROM \`${datasetId}\`.INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
            JOIN \`${datasetId}\`.INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
              ON kcu.constraint_name = tc.constraint_name
            JOIN \`${datasetId}\`.INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu
              ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
          `);

          allFkRows.push(...fkRows);
        } catch (fkErr: any) {
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_FETCH_FK_BIGQUERY_ERROR',
              originalError: fkErr
            }),
            logLevel: 'Error',
            logger: logger,
            cs: cs
          });
        }

        try {
          let [constraintRows]: QueryRowsResponse = await bigquery.query(`
            SELECT
              kcu.table_schema,
              kcu.table_name,
              kcu.column_name,
              tc.constraint_name,
              tc.constraint_type
            FROM \`${datasetId}\`.INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
            JOIN \`${datasetId}\`.INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
              ON kcu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
          `);

          allConstraintRows.push(...constraintRows);
        } catch (constraintErr: any) {
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_FETCH_CONSTRAINTS_BIGQUERY_ERROR',
              originalError: constraintErr
            }),
            logLevel: 'Error',
            logger: logger,
            cs: cs
          });
        }
      } catch (datasetErr: any) {
        logToConsoleBackend({
          log: new ServerError({
            message: 'BACKEND_FETCH_DATASET_BIGQUERY_ERROR',
            originalError: datasetErr
          }),
          logLevel: 'Error',
          logger: logger,
          cs: cs
        });
      }
    });

    let tables: RawSchemaTable[] = allTablesRows.map(row => {
      let tableConstraintRows: {
        table_schema: string;
        table_name: string;
        column_name: string;
        constraint_name: string;
        constraint_type: string;
      }[] = allConstraintRows.filter(
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

      let columns: RawSchemaColumn[] = allColumnsRows
        .filter(
          c =>
            c.table_schema === row.table_schema &&
            c.table_name === row.table_name
        )
        .map(c => {
          let foreignKeys: RawSchemaForeignKey[] = allFkRows
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
  }
}
