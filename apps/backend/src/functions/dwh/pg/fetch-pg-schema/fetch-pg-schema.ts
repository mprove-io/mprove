import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import pgPromise from 'pg-promise';
import type pg from 'pg-promise/typescript/pg-subset';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { optionsToPgOptions } from '#backend/functions/dwh/pg/options-to-pg-options/options-to-pg-options';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ServerError } from '#common/classes/server-error/server-error';
import type { ConnectionRawSchema } from '#common/types/backend/parts/connection-schemas/raw-schemas/connection-raw-schema';
import type { RawSchemaColumn } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-column';
import type { RawSchemaForeignKey } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-foreign-key';
import type { RawSchemaIndex } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-index';
import type { RawSchemaTable } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-table';

export async function fetchPgSchema(item: {
  connection: ConnectionTab;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
}): Promise<ConnectionRawSchema> {
  let { connection, cs, logger } = item;

  let postgresConnectionOptions: pg.IConnectionParameters<pg.IClient> =
    optionsToPgOptions({
      connection: connection
    });

  let pgp: pgPromise.IMain<{}, pg.IClient> = pgPromise({ noWarnings: true });

  let pgDb: pgPromise.IDatabase<{}, pg.IClient> = pgp(
    postgresConnectionOptions
  );

  try {
    let tablesRows: {
      table_schema: string;
      table_name: string;
      table_type: string;
    }[] = await pgDb.any<{
      table_schema: string;
      table_name: string;
      table_type: string;
    }>(`
      SELECT table_schema, table_name, table_type
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_type NOT IN ('LOCAL TEMPORARY')
      ORDER BY table_schema, table_name
    `);

    let columnsRows: {
      table_schema: string;
      table_name: string;
      column_name: string;
      data_type: string;
      is_nullable: string;
      element_type?: string;
    }[] = await pgDb.any<{
      table_schema: string;
      table_name: string;
      column_name: string;
      data_type: string;
      is_nullable: string;
      element_type?: string;
    }>(`
      SELECT c.table_schema, c.table_name, c.column_name, c.data_type, c.is_nullable,
             e.data_type as element_type
      FROM information_schema.columns c
      LEFT JOIN information_schema.element_types e
        ON ((c.table_catalog, c.table_schema, c.table_name, 'TABLE', c.dtd_identifier)
          = (e.object_catalog, e.object_schema, e.object_name, e.object_type, e.collection_type_identifier))
      WHERE c.table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY c.table_schema, c.table_name, c.ordinal_position
    `);

    let indexesRows: {
      schemaname: string;
      tablename: string;
      indexname: string;
      indexdef: string;
      is_primary: boolean;
    }[] = await pgDb.any<{
      schemaname: string;
      tablename: string;
      indexname: string;
      indexdef: string;
      is_primary: boolean;
    }>(`
      SELECT
        i.schemaname,
        i.tablename,
        i.indexname,
        i.indexdef,
        CASE WHEN c.contype = 'p' THEN true ELSE false END as is_primary
      FROM pg_indexes i
      LEFT JOIN pg_constraint c
        ON c.conname = i.indexname
        AND c.connamespace = (
          SELECT oid FROM pg_namespace WHERE nspname = i.schemaname
        )
        AND c.contype = 'p'
      WHERE i.schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY i.schemaname, i.tablename, i.indexname
    `);

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
      fkRows = await pgDb.any<{
        table_schema: string;
        table_name: string;
        column_name: string;
        constraint_name: string;
        referenced_schema: string;
        referenced_table: string;
        referenced_column: string;
      }>(`
        SELECT
          n.nspname AS table_schema,
          cl.relname AS table_name,
          a.attname AS column_name,
          con.conname AS constraint_name,
          rn.nspname AS referenced_schema,
          rcl.relname AS referenced_table,
          ra.attname AS referenced_column
        FROM pg_constraint con
        JOIN pg_class cl ON cl.oid = con.conrelid
        JOIN pg_namespace n ON n.oid = cl.relnamespace
        JOIN pg_class rcl ON rcl.oid = con.confrelid
        JOIN pg_namespace rn ON rn.oid = rcl.relnamespace
        JOIN LATERAL unnest(con.conkey, con.confkey)
          WITH ORDINALITY AS cols(conkey, confkey, ord) ON true
        JOIN pg_attribute a
          ON a.attrelid = con.conrelid AND a.attnum = cols.conkey
        JOIN pg_attribute ra
          ON ra.attrelid = con.confrelid AND ra.attnum = cols.confkey
        WHERE con.contype = 'f'
          AND n.nspname NOT IN ('pg_catalog', 'information_schema')
        ORDER BY n.nspname, cl.relname, a.attname
      `);
    } catch (fkErr: any) {
      logToConsoleBackend({
        log: new ServerError({
          message: 'BACKEND_FETCH_FK_POSTGRES_ERROR',
          originalError: fkErr
        }),
        logLevel: 'Error',
        logger: logger,
        cs: cs
      });
    }

    let tables: RawSchemaTable[] = tablesRows.map(row => {
      let indexes: RawSchemaIndex[] = indexesRows
        .filter(
          ix =>
            ix.schemaname === row.table_schema &&
            ix.tablename === row.table_name
        )
        .map(ix => {
          let indexDef = ix.indexdef || '';

          let colsMatch: RegExpMatchArray = indexDef.match(/\(([^)]+)\)/);

          let indexColumns = colsMatch
            ? colsMatch[1].split(',').map((s: string) => s.trim())
            : [];

          let isUnique = indexDef.toUpperCase().includes('UNIQUE') === true;

          return {
            indexName: ix.indexname,
            indexColumns: indexColumns,
            isUnique: isUnique,
            isPrimaryKey: ix.is_primary === true
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
            elementType: c.element_type ?? undefined,
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
    pgDb.$pool.end();
  }
}
