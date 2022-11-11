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
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.username,
      password: connection.password,
      ssl: connection.is_ssl === common.BoolEnum.TRUE
    };

    let queryJobId = common.makeId();

    query.status = common.QueryStatusEnum.Running;
    query.query_job_id = queryJobId;
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
        let q = await this.queriesRepository.findOne({
          where: {
            query_id: query.query_id,
            query_job_id: queryJobId
          }
        });

        if (common.isDefined(q)) {
          q.status = common.QueryStatusEnum.Completed;
          q.query_job_id = null;
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
        let q = await this.queriesRepository.findOne({
          where: {
            query_id: query.query_id,
            query_job_id: queryJobId
          }
        });

        if (common.isDefined(q)) {
          q.status = common.QueryStatusEnum.Error;
          q.data = [];
          q.query_job_id = null;
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
