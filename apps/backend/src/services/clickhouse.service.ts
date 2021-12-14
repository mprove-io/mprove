import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { DbService } from '~backend/services/db.service';
const ClickHouse = require('@apla/clickhouse');
// const { ClickHouse } = require('clickhouse');

@Injectable()
export class ClickHouseService {
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

    let options: any = {
      host: connection.postgres_host,
      port: connection.postgres_port,
      user: connection.postgres_user,
      password: connection.postgres_password,
      readonly: true
    };

    let database = connection.postgres_database;

    if (common.isDefined(database) && database.length > 0) {
      options.queryOptions = {
        database: database
      };
    }
    const ch = new ClickHouse(options);

    ch.querying(query.sql, { dataObjects: true })
      .then(async (result: any) => {
        // common.logToConsole('result');
        // common.logToConsole(result);

        let q = await this.queriesRepository.findOne({
          query_id: query.query_id,
          postgres_query_job_id: postgresQueryJobId
        });

        if (common.isDefined(q)) {
          q.status = common.QueryStatusEnum.Completed;
          q.postgres_query_job_id = null;
          q.data = result.data;
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
      .catch(async (e: any) => {
        // common.logToConsole('error');
        // common.logToConsole(e);

        let q = await this.queriesRepository.findOne({
          query_id: query.query_id,
          postgres_query_job_id: postgresQueryJobId
        });

        if (common.isDefined(q)) {
          q.status = common.QueryStatusEnum.Error;
          q.postgres_query_job_id = null;
          q.last_error_message = e.message
            ? e.message
            : JSON.stringify(e, Object.getOwnPropertyNames(e));
          q.last_error_ts = helper.makeTs();

          await this.dbService.writeRecords({
            modify: true,
            records: {
              queries: [q]
            }
          });
        }
      });

    // let options: ClickHouseClientOptions = {
    //   host: connection.postgres_host,
    //   port: connection.postgres_port,
    //   database: connection.postgres_database,
    //   username: connection.postgres_user,
    //   password: connection.postgres_password
    // };

    // let clickHouse = new ClickHouseClient(options);

    // clickHouse
    //   .query(query.sql)
    //   .pipe(
    //     tap(async data => {
    //       let q = await this.queriesRepository.findOne({
    //         query_id: query.query_id,
    //         postgres_query_job_id: postgresQueryJobId
    //       });

    //       if (common.isDefined(q)) {
    //         q.status = common.QueryStatusEnum.Completed;
    //         q.postgres_query_job_id = null;
    //         q.data = data;
    //         q.last_complete_ts = helper.makeTs();
    //         q.last_complete_duration = Math.floor(
    //           (Number(q.last_complete_ts) - Number(q.last_run_ts)) / 1000
    //         ).toString();

    //         await this.dbService.writeRecords({
    //           modify: true,
    //           records: {
    //             queries: [q]
    //           }
    //         });
    //       }
    //     })
    //   )
    //   .subscribe({
    //     // next: row => {
    //     //   // called for each row
    //     // },
    //     // complete: async () => {
    //     //   // called when stream is completed
    //     // },
    //     error: async e => {
    //       // called when an error occurred during query

    //       // common.logToConsole('error');
    //       // common.logToConsole(e);

    //       let q = await this.queriesRepository.findOne({
    //         query_id: query.query_id,
    //         postgres_query_job_id: postgresQueryJobId
    //       });

    //       if (common.isDefined(q)) {
    //         q.status = common.QueryStatusEnum.Error;
    //         q.postgres_query_job_id = null;
    //         q.last_error_message = e.message
    //           ? e.message
    //           : JSON.stringify(e, Object.getOwnPropertyNames(e));
    //         q.last_error_ts = helper.makeTs();

    //         await this.dbService.writeRecords({
    //           modify: true,
    //           records: {
    //             queries: [q]
    //           }
    //         });
    //       }
    //     }
    //   });

    return query;
  }
}
