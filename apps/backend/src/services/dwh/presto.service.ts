import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrestoClient, PrestoClientConfig } from '@prestodb/presto-js-client';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { isDefined } from '~common/functions/is-defined';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { QueriesService } from '../db/queries.service';

let retry = require('async-retry');

@Injectable()
export class PrestoService {
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

    let prestoClientConfig: PrestoClientConfig = {
      catalog: connection.options.presto.catalog,
      host: connection.options.presto.server,
      port: connection.options.presto.port,
      schema: connection.options.presto.schema,
      user: connection.options.presto.user,
      basicAuthentication:
        isDefined(connection.options.presto.user) &&
        isDefined(connection.options.presto.password)
          ? {
              user: connection.options.presto.user,
              password: connection.options.presto.password
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
      .catch(async e =>
        this.processPrestoError({
          e: e,
          queryId: queryId,
          queryJobId: queryJobId,
          projectId: projectId
        })
      );
  }

  async processPrestoError(item: {
    e: any;
    queryId: string;
    queryJobId: string;
    projectId: string;
  }) {
    let { e, queryId, queryJobId, projectId } = item;

    // console.log(e);
    // console.log(e.cause);
    // console.log(e.cause.message);

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
      q.lastErrorMessage = e.cause?.message ?? e.message; // presto specific
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
