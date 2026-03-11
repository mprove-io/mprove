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
