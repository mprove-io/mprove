import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import pgPromise from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { makeTsNumber } from '#backend/functions/make-ts-number';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ConnectionSchema,
  SchemaColumn,
  SchemaForeignKey,
  SchemaIndex,
  SchemaTable
} from '#common/interfaces/backend/connection-schema';
import { TestConnectionResult } from '#common/interfaces/to-backend/connections/to-backend-test-connection';
import { ServerError } from '#common/models/server-error';
import { TabService } from '../tab.service';

@Injectable()
export class PgService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  optionsToPostgresOptions(item: { connection: ConnectionTab }) {
    let { connection } = item;

    let connectionOptions: pg.IConnectionParameters<pg.IClient> = {
      host: connection.options.postgres.host,
      port: connection.options.postgres.port,
      database: connection.options.postgres.database,
      user: connection.options.postgres.username,
      password: connection.options.postgres.password,
      ssl:
        connection.options.postgres.isSSL === true
          ? {
              rejectUnauthorized: false
            }
          : false
    };

    return connectionOptions;
  }

  async fetchSchema(item: {
    connection: ConnectionTab;
  }): Promise<ConnectionSchema> {
    let { connection } = item;

    let postgresConnectionOptions: pg.IConnectionParameters<pg.IClient> =
      this.optionsToPostgresOptions({
        connection: connection
      });

    let pgp = pgPromise({ noWarnings: true });
    let pgDb = pgp(postgresConnectionOptions);

    try {
      let tablesRows = await pgDb.any<{
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

      let columnsRows = await pgDb.any<{
        table_schema: string;
        table_name: string;
        column_name: string;
        data_type: string;
        is_nullable: string;
      }>(`
        SELECT table_schema, table_name, column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name, ordinal_position
      `);

      let indexesRows = await pgDb.any<{
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
            message: ErEnum.BACKEND_FETCH_FK_POSTGRES_ERROR,
            originalError: fkErr
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }

      let tables: SchemaTable[] = tablesRows.map(row => {
        let columns: SchemaColumn[] = columnsRows
          .filter(
            c =>
              c.table_schema === row.table_schema &&
              c.table_name === row.table_name
          )
          .map(c => {
            let foreignKeys: SchemaForeignKey[] = fkRows
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

            return {
              columnName: c.column_name,
              dataType: c.data_type,
              isNullable: c.is_nullable === 'YES',
              foreignKeys: foreignKeys
            };
          });

        let indexes: SchemaIndex[] = indexesRows
          .filter(
            ix =>
              ix.schemaname === row.table_schema &&
              ix.tablename === row.table_name
          )
          .map(ix => {
            let indexDef = ix.indexdef || '';
            let colsMatch = indexDef.match(/\(([^)]+)\)/);
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

        return {
          schemaName: row.table_schema,
          tableName: row.table_name,
          tableType: row.table_type,
          columns: columns,
          indexes: indexes
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
    } finally {
      pgDb.$pool.end();
    }
  }

  async testConnection(item: {
    connection: ConnectionTab;
  }): Promise<TestConnectionResult> {
    let { connection } = item;

    let postgresConnectionOptions: pg.IConnectionParameters<pg.IClient> =
      this.optionsToPostgresOptions({
        connection: connection
      });

    try {
      let errorMessage: string;

      let pgp = pgPromise({ noWarnings: true });
      let pgDb = pgp(postgresConnectionOptions);

      let pc = await pgDb.connect().catch(e => {
        errorMessage = `Connection failed: ${e.message}`;
      });

      if (isDefined(errorMessage) === true) {
        return {
          isSuccess: false,
          errorMessage: errorMessage
        };
      } else if (!pc) {
        return {
          isSuccess: false,
          errorMessage: 'Connection failed'
        };
      }

      pgDb.$pool.end();

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

  async runQuery(item: {
    connection: ConnectionTab;
    queryJobId: string;
    queryId: string;
    projectId: string;
    querySql: string;
  }): Promise<void> {
    let { connection, queryJobId, queryId, querySql, projectId } = item;

    let postgresConnectionOptions: pg.IConnectionParameters<pg.IClient> =
      this.optionsToPostgresOptions({
        connection: connection
      });

    let pgp = pgPromise({ noWarnings: true });
    let pgDb = pgp(postgresConnectionOptions);

    await pgDb
      .any(querySql)
      .then(async (data: any) => {
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
        this.processError({
          e: e,
          queryId: queryId,
          queryJobId: queryJobId,
          projectId: projectId
        })
      );

    pgDb.$pool.end();
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
