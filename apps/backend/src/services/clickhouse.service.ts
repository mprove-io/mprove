import {
  ClickHouseClient,
  ClickHouseClientOptions,
  ClickHouseConnectionProtocol
} from '@depyronick/clickhouse-client';
// const ClickHouse = require('@apla/clickhouse');
// const { ClickHouse } = require('clickhouse');
import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { DbService } from '~backend/services/db.service';

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

    //
    // depyronick
    //

    let options: ClickHouseClientOptions = {
      protocol:
        connection.is_ssl === common.BoolEnum.TRUE
          ? ClickHouseConnectionProtocol.HTTPS
          : ClickHouseConnectionProtocol.HTTP,
      host: connection.host,
      port: connection.port,
      // database: connection.postgres_database,
      username: connection.username,
      password: connection.password
    };

    // let database = connection.postgres_database;

    // if (common.isDefined(database) && database.length > 0) {
    //   options.queryOptions = {
    //     database: database
    //   };
    // }

    let clickhouse = new ClickHouseClient(options);

    this.runQ({
      clickhouse: clickhouse,
      query: query,
      queryJobId: queryJobId
    });

    // '@apla/clickhouse'

    // let options: any = {
    //   host: connection.postgres_host,
    //   port: connection.postgres_port,
    //   user: connection.postgres_user,
    //   password: connection.postgres_password,
    //   readonly: true,
    //   protocol: connection.is_ssl === common.BoolEnum.TRUE ? 'https:' : 'http:'
    // };

    // const ch = new ClickHouse(options);

    // ch.querying(query.sql, { dataObjects: true })
    //   .then(async (result: any) => {
    //     // common.logToConsole('result');
    //     // common.logToConsole(result);

    // let q = await this.queriesRepository.findOne({
    //   where: {
    //     query_id: query.query_id,
    //     postgres_query_job_id: postgresQueryJobId
    //   }
    // });

    //     if (common.isDefined(q)) {
    //       q.status = common.QueryStatusEnum.Completed;
    //       q.postgres_query_job_id = null;
    //       q.data = result.data;
    //       q.last_complete_ts = helper.makeTs();
    //       q.last_complete_duration = Math.floor(
    //         (Number(q.last_complete_ts) - Number(q.last_run_ts)) / 1000
    //       ).toString();

    //       await this.dbService.writeRecords({
    //         modify: true,
    //         records: {
    //           queries: [q]
    //         }
    //       });
    //     }
    //   })
    //   .catch(async (e: any) => {
    //     // common.logToConsole('error');
    //     // common.logToConsole(e);

    // let q = await this.queriesRepository.findOne({
    //   where: {
    //     query_id: query.query_id,
    //     postgres_query_job_id: postgresQueryJobId
    //   }
    // });

    //     if (common.isDefined(q)) {
    //       q.status = common.QueryStatusEnum.Error;
    //       q.data = [];
    //       q.postgres_query_job_id = null;
    //       q.last_error_message = e.message
    //         ? e.message
    //         : JSON.stringify(e, Object.getOwnPropertyNames(e));
    //       q.last_error_ts = helper.makeTs();

    //       await this.dbService.writeRecords({
    //         modify: true,
    //         records: {
    //           queries: [q]
    //         }
    //       });
    //     }
    //   });

    //
    // TimonKK (json response issue)
    //

    // let clickhouse = new ClickHouse({
    //   url:
    //     connection.is_ssl === common.BoolEnum.TRUE
    //       ? `https://${connection.postgres_host}`
    //       : `http://${connection.postgres_host}`,
    //   port: connection.postgres_port,
    //   debug: true,
    //   basicAuth: {
    //     username: connection.postgres_user,
    //     password: connection.postgres_password
    //   },
    //   isUseGzip: false,
    //   format: 'json', // "json" || "csv" || "tsv"
    //   raw: false,
    //   config: {
    //     // session_id: 'session_id if need',
    //     // session_timeout: 60,
    //     output_format_json_quote_64bit_integers: 0,
    //     // enable_http_compression: 0,
    //     database: 'c_db'
    //   }
    //   // ,

    //   // This object merge with request params (see request lib docs)
    //   // reqParams: {}
    // });

    // this.runQ2(clickhouse, query, postgresQueryJobId);

    return query;
  }

  private async runQ(item: {
    clickhouse: ClickHouseClient;
    query: entities.QueryEntity;
    queryJobId: string;
  }) {
    let { clickhouse, query, queryJobId } = item;

    let data: any = [];

    clickhouse.query(query.sql).subscribe({
      next: (row: any) => {
        // called for each row

        data.push(row);
      },
      complete: async () => {
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
      },
      error: async (e: any) => {
        // common.logToConsole('error');
        // common.logToConsole(e);

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
      }
    });
  }

  // private async runQ2(clickhouse: any, query: any, postgresQueryJobId: any) {
  //   let data = await clickhouse
  //     .query(query.sql)
  //     .toPromise()
  //     .catch(async (e: any) => {
  //       common.logToConsole('error');
  //       common.logToConsole(e);

  //       let q = await this.queriesRepository.findOne({
  //         where: {
  //           query_id: query.query_id,
  //           postgres_query_job_id: postgresQueryJobId
  //         }
  //       });

  //       if (common.isDefined(q)) {
  //         q.status = common.QueryStatusEnum.Error;
  //         q.data = [];
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
  //     });

  //   common.logToConsole('data');
  //   common.logToConsole(data);

  //   let q = await this.queriesRepository.findOne({
  //     where: {
  //       query_id: query.query_id,
  //       postgres_query_job_id: postgresQueryJobId
  //     }
  //   });

  //   if (common.isDefined(q)) {
  //     q.status = common.QueryStatusEnum.Completed;
  //     q.postgres_query_job_id = null;
  //     q.data = data;
  //     q.last_complete_ts = helper.makeTs();
  //     q.last_complete_duration = Math.floor(
  //       (Number(q.last_complete_ts) - Number(q.last_run_ts)) / 1000
  //     ).toString();

  //     await this.dbService.writeRecords({
  //       modify: true,
  //       records: {
  //         queries: [q]
  //       }
  //     });
  //   }
  // }
}
