import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import * as pgPromise from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';

let retry = require('async-retry');

@Injectable()
export class PgService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async runQuery(item: {
    connection: schemaPostgres.ConnectionEnt;
    queryJobId: string;
    queryId: string;
    projectId: string;
    querySql: string;
  }) {
    let { connection, queryJobId, queryId, querySql, projectId } = item;

    let cn: pg.IConnectionParameters<pg.IClient> = {
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.username,
      password: connection.password,
      ssl:
        connection.isSsl === true
          ? {
              rejectUnauthorized: false
            }
          : false
    };

    let pgp = pgPromise({ noWarnings: true });
    let pgDb = pgp(cn);

    await pgDb
      .any(querySql)
      .then(async (data: any) => {
        let q = await this.db.drizzle.query.queriesTable.findFirst({
          where: and(
            eq(queriesTable.queryId, queryId),
            eq(queriesTable.queryJobId, queryJobId),
            eq(queriesTable.projectId, projectId)
          )
        });

        // let q = await this.queriesRepository.findOne({
        //   where: {
        //     query_id: queryId,
        //     query_job_id: queryJobId,
        //     project_id: projectId
        //   }
        // });

        if (common.isDefined(q)) {
          q.status = common.QueryStatusEnum.Completed;
          q.queryJobId = null;
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

          // await this.dbService.writeRecords({
          //   modify: true,
          //   records: {
          //     queries: [q]
          //   }
          // });
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

        // let q = await this.queriesRepository.findOne({
        //   where: {
        //     query_id: queryId,
        //     query_job_id: queryJobId,
        //     project_id: projectId
        //   }
        // });

        if (common.isDefined(q)) {
          q.status = common.QueryStatusEnum.Error;
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

          // await this.dbService.writeRecords({
          //   modify: true,
          //   records: {
          //     queries: [q]
          //   }
          // });
        }
      });
  }
}
