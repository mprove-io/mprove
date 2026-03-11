import { DBSQLClient, DBSQLLogger, LogLevel } from '@databricks/sql';
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
  ConnectionSchema,
  SchemaColumn,
  SchemaTable
} from '#common/interfaces/backend/connection-schema';
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

  optionsToDatabricksConfig(item: { connection: ConnectionTab }) {
    let { connection } = item;

    let config = {
      authType: connection.options.databricks.authType,
      host: connection.options.databricks.host,
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

  async fetchSchema(item: {
    connection: ConnectionTab;
  }): Promise<ConnectionSchema> {
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

      await session.close();

      let tables: SchemaTable[] = tablesRows.map(row => {
        let columns: SchemaColumn[] = columnsRows
          .filter(
            c =>
              c.table_schema === row.table_schema &&
              c.table_name === row.table_name
          )
          .map(c => ({
            columnName: c.column_name,
            dataType: c.data_type,
            isNullable: c.is_nullable === 'YES'
          }));

        return {
          schemaName: row.table_schema,
          tableName: row.table_name,
          tableType: row.table_type,
          columns: columns,
          indexes: [] as SchemaTable['indexes']
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
