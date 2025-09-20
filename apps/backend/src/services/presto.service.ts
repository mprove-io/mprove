import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrestoClient, PrestoClientConfig } from '@prestodb/presto-js-client';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { ConnectionEnt } from '~backend/drizzle/postgres/schema/connections';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { isDefined } from '~common/functions/is-defined';

let retry = require('async-retry');

@Injectable()
export class PrestoService {
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

    let prestoClientConfig: PrestoClientConfig = {
      catalog: connection.prestoOptions.catalog,
      host: connection.prestoOptions.server,
      port: connection.prestoOptions.port,
      schema: connection.prestoOptions.schema,
      user: connection.prestoOptions.user,
      basicAuthentication:
        isDefined(connection.prestoOptions.user) &&
        isDefined(connection.prestoOptions.password)
          ? {
              user: connection.prestoOptions.user,
              password: connection.prestoOptions.password
            }
          : undefined,
      extraHeaders: { 'X-Presto-Session': 'legacy_unnest=true' }
    };

    let pc = new PrestoClient(prestoClientConfig);

    await pc
      .query(querySql)
      .then(async result => {
        let columns = result.columns;

        let data = result.data.map(r => {
          let dRow: { [name: string]: any } = {};

          columns.forEach((column: any, index: number) => {
            dRow[column.name as string] = r[index];
          });

          return dRow;
        });

        let q = await this.db.drizzle.query.queriesTable.findFirst({
          where: and(
            eq(queriesTable.queryId, queryId),
            eq(queriesTable.queryJobId, queryJobId),
            eq(queriesTable.projectId, projectId)
          )
        });

        if (isDefined(q)) {
          q.status = QueryStatusEnum.Completed;
          q.queryJobId = undefined; // null;
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
