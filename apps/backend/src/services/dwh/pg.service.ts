import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import * as pgPromise from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { ConnectionTab } from '~backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { isDefined } from '~common/functions/is-defined';
import { TestConnectionResult } from '~common/interfaces/to-backend/connections/to-backend-test-connection';
import { TabService } from '../tab.service';

let retry = require('async-retry');

@Injectable()
export class PgService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  optionsToPostgresOptions(item: {
    connection: ConnectionTab;
  }) {
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

      pgp.end();

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

    pgp.end();
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
