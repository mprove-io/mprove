import { TrinoConnectionConfiguration } from '@malloydata/db-trino/dist/trino_connection';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { BasicAuth, Trino } from 'trino-client';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { QueriesService } from '../db/queries.service';

let retry = require('async-retry');

@Injectable()
export class TrinoService {
  constructor(
    private queriesService: QueriesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async runQuery(item: {
    connection: ProjectConnection;
    queryJobId: string;
    queryId: string;
    projectId: string;
    querySql: string;
  }): Promise<void> {
    let { connection, queryJobId, queryId, querySql, projectId } = item;

    let connectionOptions: TrinoConnectionConfiguration = {
      server: connection.options.trino.server,
      catalog: connection.options.trino.catalog,
      schema: connection.options.trino.schema,
      user: connection.options.trino.user,
      password: connection.options.trino.password,
      extraConfig: connection.options.trino.extraConfig
    };

    let tc = Trino.create({
      server: connectionOptions.server,
      catalog: connectionOptions.catalog,
      schema: connectionOptions.schema,
      auth: new BasicAuth(connectionOptions.user, connectionOptions.password),
      ...connectionOptions.extraConfig
    });

    await tc
      .query(querySql)
      .then(async result => {
        let queryResult = await result.next();

        let q = await this.db.drizzle.query.queriesTable
          .findFirst({
            where: and(
              eq(queriesTable.queryId, queryId),
              eq(queriesTable.queryJobId, queryJobId),
              eq(queriesTable.projectId, projectId)
            )
          })
          .then(x => this.queriesService.entToTab(x));

        if (isDefined(q) || isUndefined(queryResult?.value)) {
          if (
            isUndefined(queryResult?.value) ||
            isDefined(queryResult?.value?.error)
          ) {
            q.status = QueryStatusEnum.Error;
            q.data = [];
            q.queryJobId = undefined; // null
            q.lastErrorMessage = isUndefined(queryResult?.value)
              ? 'queryResult.value is not defined'
              : queryResult?.value?.error?.toString();
            q.lastErrorTs = makeTsNumber();
          } else {
            let columns = queryResult.value.columns;

            let outputRows: unknown[][] = [];

            while (queryResult !== null) {
              let rows = queryResult.value.data ?? [];
              for (let row of rows) {
                outputRows.push(row as unknown[]);
              }
              if (!queryResult.done) {
                queryResult = await result.next();
              } else {
                break;
              }
            }

            let data = outputRows.map(r => {
              let dRow: { [name: string]: any } = {};

              columns.forEach((column: any, index: number) => {
                dRow[column.name as string] = r[index];
              });

              return dRow;
            });

            q.status = QueryStatusEnum.Completed;
            q.queryJobId = undefined; // null;
            q.data = data;
            q.lastCompleteTs = makeTsNumber();
            q.lastCompleteDuration = Math.floor(
              (Number(q.lastCompleteTs) - Number(q.lastRunTs)) / 1000
            );
          }

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
      .then(x => this.queriesService.entToTab(x));

    if (isDefined(q)) {
      q.status = QueryStatusEnum.Error;
      q.data = [];
      q.queryJobId = undefined; // null
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
