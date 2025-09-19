import { TrinoConnectionConfiguration } from '@malloydata/db-trino/dist/trino_connection';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { BasicAuth, Trino } from 'trino-client';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { ConnectionEnt } from '~backend/drizzle/postgres/schema/connections';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';

let retry = require('async-retry');

@Injectable()
export class TrinoService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async runQuery(item: {
    connection: ConnectionEnt;
    queryJobId: string;
    queryId: string;
    projectId: string;
    querySql: string;
  }) {
    let { connection, queryJobId, queryId, querySql, projectId } = item;

    let connectionOptions: TrinoConnectionConfiguration = {
      server: connection.trinoOptions.server,
      catalog: connection.trinoOptions.catalog,
      schema: connection.trinoOptions.schema,
      user: connection.trinoOptions.user,
      password: connection.trinoOptions.password,
      extraConfig: connection.trinoOptions.extraConfig
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

        let q = await this.db.drizzle.query.queriesTable.findFirst({
          where: and(
            eq(queriesTable.queryId, queryId),
            eq(queriesTable.queryJobId, queryJobId),
            eq(queriesTable.projectId, projectId)
          )
        });

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
            // let columns = queryResult.value.columns;

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

            let data = outputRows;

            console.log('data');
            console.log(data);

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
      .catch(async e => {
        let q = await this.db.drizzle.query.queriesTable.findFirst({
          where: and(
            eq(queriesTable.queryId, queryId),
            eq(queriesTable.queryJobId, queryJobId),
            eq(queriesTable.projectId, projectId)
          )
        });

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
      });
  }
}
