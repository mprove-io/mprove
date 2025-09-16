import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import * as MYSQL from 'mysql2/promise';
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
export class MysqlService {
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

    let connectionOptions: MYSQL.ConnectionOptions = {
      host: connection.mysqlOptions.host,
      port: connection.mysqlOptions.port,
      database: connection.mysqlOptions.database,
      user: connection.mysqlOptions.user,
      password: connection.mysqlOptions.password,
      multipleStatements: true,
      decimalNumbers: true,
      timezone: '+00:00'
    };

    // let pgp = pgPromise({ noWarnings: true });
    // let pgDb = pgp(cn);

    let mc = await MYSQL.createConnection(connectionOptions);

    // packages/malloy-db-mysql/src/mysql_connection.ts
    await mc
      .query(
        // LTNOTE: Need to make the group_concat_max_len configurable.
        "set @@session.time_zone = 'UTC';" +
          // LTNOTE: for nesting this is the max buffer size.  Currently set to 10M, have to figure out perf implications.
          'SET SESSION group_concat_max_len = 10000000;' +
          // Need this to make NULL LAST in order by (ISNULL(exp) can't appear in an ORDER BY without it)
          "SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));"
      )
      .catch(async e => {
        console.log('error start mc.query');
        console.log(e);
      });

    await mc
      .query(querySql)
      .then(async (data: any) => {
        console.log('data');
        console.log(data);

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
