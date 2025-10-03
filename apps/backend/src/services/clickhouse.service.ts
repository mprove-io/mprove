import {
  ClickHouseClient,
  ClickHouseClientOptions,
  ClickHouseConnectionProtocol
} from '@depyronick/clickhouse-client';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { isDefined } from '~common/functions/is-defined';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';

let retry = require('async-retry');

@Injectable()
export class ClickHouseService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async runQuery(item: {
    connection: ProjectConnection;
    queryJobId: string;
    queryId: string;
    querySql: string;
    projectId: string;
  }): Promise<void> {
    let { connection, queryJobId, queryId, querySql, projectId } = item;

    let options: ClickHouseClientOptions = {
      protocol:
        connection.options.clickhouse.isSSL === true
          ? ClickHouseConnectionProtocol.HTTPS
          : ClickHouseConnectionProtocol.HTTP,
      host: connection.options.clickhouse.host,
      port: connection.options.clickhouse.port,
      username: connection.options.clickhouse.username,
      password: connection.options.clickhouse.password
    };

    let clickhouse = new ClickHouseClient(options);

    await this.runQ({
      clickhouse: clickhouse,
      queryJobId: queryJobId,
      queryId: queryId,
      querySql: querySql,
      projectId: projectId
    });
  }

  private async runQ(item: {
    clickhouse: ClickHouseClient;
    queryJobId: string;
    queryId: string;
    querySql: string;
    projectId: string;
  }) {
    let { clickhouse, queryJobId, queryId, querySql, projectId } = item;

    return new Promise<void>((resolve, reject) => {
      let data: any = [];

      clickhouse.query(querySql).subscribe({
        next: (row: any) => {
          // called for each row

          data.push(row);
        },
        complete: async () => {
          let q = await this.db.drizzle.query.queriesTable.findFirst({
            where: and(
              eq(queriesTable.queryId, queryId),
              eq(queriesTable.queryJobId, queryJobId),
              eq(queriesTable.projectId, projectId)
            )
          });

          if (isDefined(q)) {
            q.status = QueryStatusEnum.Completed;
            q.queryJobId = undefined; // null
            q.data = data;
            q.lastCompleteTs = makeTsNumber();
            q.lastCompleteDuration = Math.floor(
              (Number(q.lastCompleteTs) - Number(q.lastRunTs)) / 1000
            );

            await retry(
              async () => {
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insertOrUpdate: {
                        queries: [q]
                      }
                    })
                );
              },
              getRetryOption(this.cs, this.logger)
            );

            resolve();
          }
        },
        error: async (e: any) => {
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
            q.lastErrorMessage = e.message
              ? e.message
              : JSON.stringify(e, Object.getOwnPropertyNames(e));
            q.lastErrorTs = makeTsNumber();

            await retry(
              async () => {
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insertOrUpdate: {
                        queries: [q]
                      }
                    })
                );
              },
              getRetryOption(this.cs, this.logger)
            );

            resolve();
          }
        }
      });
    });
  }
}
