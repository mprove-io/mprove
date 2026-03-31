import { DBSQLClient, DBSQLLogger, LogLevel } from '@databricks/sql';
import type { ConnectionConfigEntry } from '@malloydata/malloy';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { makeTsNumber } from '#backend/functions/make-ts-number';
import { DatabricksAuthTypeEnum } from '#common/enums/databricks-auth-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ConnectionRawSchema,
  RawSchemaColumn,
  RawSchemaForeignKey,
  RawSchemaIndex,
  RawSchemaTable
} from '#common/interfaces/backend/connection-schemas/raw-schema';
import type { MalloyConfigPart } from '#common/interfaces/backend/malloy-config-part';
import { FetchSampleResult } from '#common/interfaces/to-backend/connections/fetch-sample-result';
import { TestConnectionResult } from '#common/interfaces/to-backend/connections/to-backend-test-connection';
import { ServerError } from '#common/models/server-error';
import { TabService } from '../tab.service';

const quietLogger = new DBSQLLogger({ level: LogLevel.error });

@Injectable()
export class DatabricksService {
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
    let opts = connection.options.databricks;
    let envs: Record<string, string> = {};
    let files: { path: string; data: string }[] = [];

    if (isDefined(opts.host)) {
      envs[`${envPrefix}_HOST`] = String(opts.host);
    }
    if (isDefined(opts.path)) {
      envs[`${envPrefix}_PATH`] = String(opts.path);
    }
    if (isDefined(opts.token)) {
      envs[`${envPrefix}_TOKEN`] = String(opts.token);
    }
    if (isDefined(opts.oauthClientId)) {
      envs[`${envPrefix}_OAUTH_CLIENT_ID`] = String(opts.oauthClientId);
    }
    if (isDefined(opts.oauthClientSecret)) {
      envs[`${envPrefix}_OAUTH_CLIENT_SECRET`] = String(opts.oauthClientSecret);
    }
    if (isDefined(opts.defaultCatalog)) {
      envs[`${envPrefix}_DEFAULT_CATALOG`] = String(opts.defaultCatalog);
    }
    if (isDefined(opts.defaultSchema)) {
      envs[`${envPrefix}_DEFAULT_SCHEMA`] = String(opts.defaultSchema);
    }
    if (isDefined(opts.authType)) {
      envs[`${envPrefix}_AUTH_TYPE`] = String(opts.authType);
    }

    let malloyConnectionConfigEntry: ConnectionConfigEntry = {
      is: 'databricks',
      host: { env: `${envPrefix}_HOST` },
      path: { env: `${envPrefix}_PATH` },
      token: { env: `${envPrefix}_TOKEN` },
      oauthClientId: { env: `${envPrefix}_OAUTH_CLIENT_ID` },
      oauthClientSecret: { env: `${envPrefix}_OAUTH_CLIENT_SECRET` },
      defaultCatalog: { env: `${envPrefix}_DEFAULT_CATALOG` },
      defaultSchema: { env: `${envPrefix}_DEFAULT_SCHEMA` }
    };

    return {
      malloyConnectionConfigEntry: malloyConnectionConfigEntry,
      envs: envs,
      files: files
    };
  }

  optionsToDatabricksConfig(item: { connection: ConnectionTab }) {
    let { connection } = item;

    let config = {
      authType: connection.options.databricks.authType,
      host:
        connection.options.databricks.internalHost ||
        connection.options.databricks.host,
      path: connection.options.databricks.path,
      token: connection.options.databricks.token,
      oauthClientId: connection.options.databricks.oauthClientId,
      oauthClientSecret: connection.options.databricks.oauthClientSecret,
      defaultCatalog: connection.options.databricks.defaultCatalog,
      defaultSchema: connection.options.databricks.defaultSchema
    };

    return config;
  }

  buildConnectOptions(item: {
    config: ReturnType<DatabricksService['optionsToDatabricksConfig']>;
  }) {
    let { config } = item;

    if (config.authType === DatabricksAuthTypeEnum.OAuthM2M) {
      return {
        host: config.host,
        path: config.path,
        authType: 'databricks-oauth' as const,
        oauthClientId: config.oauthClientId,
        oauthClientSecret: config.oauthClientSecret
      };
    } else {
      return {
        host: config.host,
        path: config.path,
        token: config.token
      };
    }
  }

  async testConnection(item: {
    connection: ConnectionTab;
  }): Promise<TestConnectionResult> {
    let { connection } = item;

    let config = this.optionsToDatabricksConfig({
      connection: connection
    });

    let client = new DBSQLClient({ logger: quietLogger });

    try {
      await client.connect(this.buildConnectOptions({ config }));

      let session = await client.openSession();

      let operation = await session.executeStatement('SELECT 1', {
        runAsync: true
      });
      await operation.fetchAll();
      await operation.close();

      await session.close();
      await client.close();

      return {
        isSuccess: true,
        errorMessage: undefined
      };
    } catch (err: any) {
      try {
        await client.close();
      } catch (closeErr: any) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_DATABRICKS_FAILED_TO_CLOSE_CONNECTION,
            originalError: closeErr
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }

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

    let config = this.optionsToDatabricksConfig({
      connection: connection
    });

    let client = new DBSQLClient({ logger: quietLogger });

    try {
      await client.connect(this.buildConnectOptions({ config: config }));

      let session = await client.openSession();

      let sqlText: string;

      if (isDefined(columnName)) {
        sqlText = `SELECT DISTINCT \`${columnName}\` FROM (SELECT \`${columnName}\` FROM \`${schemaName}\`.\`${tableName}\` LIMIT 10000) sub LIMIT 100`;
      } else {
        let sqlOffset = isDefined(offset) ? offset : 0;
        sqlText = `SELECT * FROM \`${schemaName}\`.\`${tableName}\` LIMIT 100 OFFSET ${sqlOffset}`;
      }

      let operation = await session.executeStatement(sqlText, {
        runAsync: true
      });
      let resultRows = (await operation.fetchAll()) as any[];
      await operation.close();
      await session.close();

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
    } finally {
      try {
        await client.close();
      } catch (err: any) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_DATABRICKS_FAILED_TO_CLOSE_CONNECTION,
            originalError: err
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    }
  }

  async fetchSchema(item: {
    connection: ConnectionTab;
  }): Promise<ConnectionRawSchema> {
    let { connection } = item;

    let config = this.optionsToDatabricksConfig({
      connection: connection
    });

    let client = new DBSQLClient({ logger: quietLogger });

    try {
      await client.connect(this.buildConnectOptions({ config: config }));

      let session = await client.openSession();

      let tablesOperation = await session.executeStatement(
        `
        SELECT table_schema, table_name, table_type
        FROM information_schema.tables
        WHERE table_catalog = '${config.defaultCatalog}'
          AND table_schema != 'information_schema'

        ORDER BY table_schema, table_name
        `,
        { runAsync: true }
      );
      let tablesRows = (await tablesOperation.fetchAll()) as {
        table_schema: string;
        table_name: string;
        table_type: string;
      }[];
      await tablesOperation.close();

      let columnsOperation = await session.executeStatement(
        `
        SELECT table_schema, table_name, column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_catalog = '${config.defaultCatalog}'
          AND table_schema != 'information_schema'
        ORDER BY table_schema, table_name, ordinal_position
        `,
        { runAsync: true }
      );
      let columnsRows = (await columnsOperation.fetchAll()) as {
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
        let fkOperation = await session.executeStatement(
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
            message: ErEnum.BACKEND_FETCH_FK_DATABRICKS_ERROR,
            originalError: fkErr
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
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
        let constraintOperation = await session.executeStatement(
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
            message: ErEnum.BACKEND_FETCH_CONSTRAINTS_DATABRICKS_ERROR,
            originalError: constraintErr
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }

      await session.close();

      let tables: RawSchemaTable[] = tablesRows.map(row => {
        let tableConstraintRows = constraintRows.filter(
          cr =>
            cr.table_schema === row.table_schema &&
            cr.table_name === row.table_name
        );

        let constraintNames = [
          ...new Set(tableConstraintRows.map(cr => cr.constraint_name))
        ];

        let indexes: RawSchemaIndex[] = constraintNames.map(constraintName => {
          let constraintGroup = tableConstraintRows.filter(
            cr => cr.constraint_name === constraintName
          );
          let isPrimaryKey =
            constraintGroup[0].constraint_type === 'PRIMARY KEY';
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

            let isPrimaryKey = indexes.some(
              idx =>
                idx.isPrimaryKey === true &&
                idx.indexColumns.includes(c.column_name)
            );

            let isUnique = indexes.some(
              idx =>
                idx.isUnique === true &&
                idx.indexColumns.includes(c.column_name)
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
      try {
        await client.close();
      } catch (err: any) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_DATABRICKS_FAILED_TO_CLOSE_CONNECTION,
            originalError: err
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    }
  }

  async runQuery(item: {
    connection: ConnectionTab;
    queryJobId: string;
    queryId: string;
    querySql: string;
    projectId: string;
  }): Promise<void> {
    let { connection, queryJobId, queryId, querySql, projectId } = item;

    let config = this.optionsToDatabricksConfig({
      connection: connection
    });

    let client = new DBSQLClient({ logger: quietLogger });

    try {
      await client.connect(this.buildConnectOptions({ config }));

      let session = await client.openSession();

      let operation = await session.executeStatement(querySql, {
        runAsync: true
      });

      let rows = await operation.fetchAll();

      await operation.close();

      await session.close();

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
        q.data = rows;
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
    } catch (e) {
      await this.processError({
        e: e,
        queryId: queryId,
        queryJobId: queryJobId,
        projectId: projectId
      });
    } finally {
      try {
        await client.close();
      } catch (err: any) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_DATABRICKS_FAILED_TO_CLOSE_CONNECTION,
            originalError: err
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    }
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
