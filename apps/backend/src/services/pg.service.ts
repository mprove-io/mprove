import { Injectable } from '@nestjs/common';
import * as pgPromise from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { DbService } from '~backend/services/db.service';

@Injectable()
export class PgService {
  constructor(
    private queriesRepository: repositories.QueriesRepository,
    private dbService: DbService
  ) {}

  async runQuery(item: {
    userId: string;
    query: entities.QueryEntity;
    connection: entities.ConnectionEntity;
  }) {
    let { query, userId, connection } = item;

    let cn: pg.IConnectionParameters<pg.IClient> = {
      host: connection.postgres_host,
      port: connection.postgres_port,
      database: connection.postgres_database,
      user: connection.postgres_user,
      password: connection.postgres_password
    };

    let postgresQueryJobId = common.makeId();

    query.status = common.QueryStatusEnum.Running;
    query.postgres_query_job_id = postgresQueryJobId;
    query.last_run_by = userId;
    query.last_run_ts = helper.makeTs();

    await this.dbService.writeRecords({
      modify: true,
      records: {
        queries: [query]
      }
    });

    let pgp = pgPromise({ noWarnings: true });
    let pgDb = pgp(cn);

    pgDb
      .any(query.sql)
      .then(async (data: any) => {
        // common.logToConsole('data');
        // common.logToConsole(data);

        let q = await this.queriesRepository.findOne({
          query_id: query.query_id,
          postgres_query_job_id: postgresQueryJobId
        });

        if (common.isDefined(q)) {
          q.status = common.QueryStatusEnum.Completed;
          q.postgres_query_job_id = null;
          q.data = data;
          q.last_complete_ts = helper.makeTs();
          q.last_complete_duration = Math.floor(
            (Number(q.last_complete_ts) - Number(q.last_run_ts)) / 1000
          ).toString();

          await this.dbService.writeRecords({
            modify: true,
            records: {
              queries: [q]
            }
          });
        }
      })
      .catch(async e => {
        // common.logToConsole('error');
        // common.logToConsole(error);

        let q = await this.queriesRepository.findOne({
          query_id: query.query_id,
          postgres_query_job_id: postgresQueryJobId
        });

        if (common.isDefined(q)) {
          q.status = common.QueryStatusEnum.Error;
          q.postgres_query_job_id = null;
          q.last_error_message = e.message;
          q.last_error_ts = helper.makeTs();

          await this.dbService.writeRecords({
            modify: true,
            records: {
              queries: [q]
            }
          });
        }
      });

    return query;
  }
}
