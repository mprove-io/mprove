import { type DuckDBConnection, DuckDBInstance, Json } from '@duckdb/node-api';
import { DuckDBResultReader } from '@duckdb/node-api/lib/DuckDBResultReader';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { isDefined } from '#common/functions/is-defined';
import { TestConnectionResult } from '#common/interfaces/to-backend/connections/to-backend-test-connection';
import { BackendConfig } from '~backend/config/backend-config';
import { Db, DRIZZLE } from '~backend/drizzle/drizzle.module';
import { ConnectionTab } from '~backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { TabService } from '../tab.service';

let retry = require('async-retry');

@Injectable()
export class DuckDbService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  optionsToDuckDbOptions(item: { connection: ConnectionTab }) {
    let { connection } = item;

    let dbPath =
      connection.options.motherduck.attachModeSingle === true &&
      connection.options.motherduck.database?.length > 0
        ? `md:${connection.options.motherduck.database}?attach_mode=single&saas_mode=true`
        : `md:${connection.options.motherduck.database}?saas_mode=true`;

    let duckdbConnectionOptions: Record<string, string> = {
      motherduck_token: connection.options.motherduck.motherduckToken
    };

    if (connection.options.motherduck.accessModeReadOnly === true) {
      duckdbConnectionOptions.access_mode = 'READ_ONLY';
    }

    return { duckdbConnectionOptions, dbPath };
  }

  async testConnection(item: {
    connection: ConnectionTab;
  }): Promise<TestConnectionResult> {
    let { connection } = item;

    let { duckdbConnectionOptions, dbPath } = this.optionsToDuckDbOptions({
      connection: connection
    });

    try {
      let db: DuckDBInstance = await DuckDBInstance.create(
        dbPath,
        duckdbConnectionOptions
      );

      let dc: DuckDBConnection = await db.connect();

      await dc.runAndReadAll('SELECT 1');

      dc.closeSync();
      db.closeSync();

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

    let { duckdbConnectionOptions, dbPath } = this.optionsToDuckDbOptions({
      connection: connection
    });

    let db: DuckDBInstance = await DuckDBInstance.create(
      dbPath,
      duckdbConnectionOptions
    );

    let dc: DuckDBConnection = await db.connect();

    await dc
      .runAndReadAll(querySql)
      .then(async (reader: DuckDBResultReader) => {
        let data: Record<string, Json>[] = reader.getRowObjectsJson();
        // let data: Record<string, Json>[] = reader.getRowObjects();

        // data = JSON.parse(
        //   JSON.stringify(data, (_key, value) => {
        //     if (typeof value === 'bigint') {
        //       return Number(value);
        //     }
        //     return value;
        //   })
        // );

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

    dc.closeSync();
    db.closeSync();
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
