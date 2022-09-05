import { Injectable } from '@nestjs/common';
import * as snowflake from 'snowflake-sdk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { DbService } from '~backend/services/db.service';

@Injectable()
export class SnowFlakeService {
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

    let options: snowflake.ConnectionOptions = {
      account: connection.account,
      username: connection.username,
      password: connection.password
      // database: '',
      // warehouse: ''
      //  database?: string | undefined;
      //  schema?: string | undefined;
      //  warehouse?: string | undefined;
      //  role?: string | undefined;
      //  clientSessionKeepAlive?: boolean | undefined;
      //  clientSessionKeepAliveHeartbeatFrequency?: number | undefined;
      //  jsTreatIntegerAsBigInt?: boolean | undefined;
      //  application?: string;
      //  authenticator?: string;
      //  token?: string;
      //  privateKey?: string | Buffer;
      //  privateKeyPath?: string;
      //  privateKeyPass?: string;
    };

    // async function connExecuteAsync(
    //   sfConnection: snowflake.Connection,
    //   execOptions: any
    // ): Promise<any> {
    //   return new Promise((resolve, reject) => {
    //     const statement = sfConnection.execute({
    //       ...execOptions,
    //       complete: function (err, stmt, rows) {
    //         if (err) {
    //           reject(err);
    //         } else {
    //           resolve({ stmt, rows });
    //         }
    //       }
    //     });
    //   });
    // }

    let snowflakeConnection = snowflake.createConnection(options);

    snowflakeConnection.connect(function (err, conn) {
      if (err) {
        console.error('Unable to connect: ' + err.message);
      } else {
        console.log(
          'Successfully connected as id: ' + snowflakeConnection.getId()
        );
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let self = this;

    snowflakeConnection.execute({
      sqlText: query.sql,
      complete: function (err, stmt, rows) {
        if (err) {
          self.catchA({
            queryJobId: queryJobId,
            query: query,
            e: err
          });

          self.disconnectA(snowflakeConnection);
        } else {
          self.resultA({
            queryJobId: queryJobId,
            query: query,
            data: { stmt, rows }
          });

          self.disconnectA(snowflakeConnection);
        }
      }
    });

    // connExecuteAsync(snowflakeConnection, {
    //   sqlText: query.sql
    //   // ,
    //   // fetchAsString: ['Number', 'Date']
    // })
    //   .then(async (data: any) => {
    //     // common.logToConsole('data');
    //     // common.logToConsole(data);

    //     let q = await this.queriesRepository.findOne({
    //       query_id: query.query_id,
    //       query_job_id: queryJobId
    //     });

    //     if (common.isDefined(q)) {
    //       q.status = common.QueryStatusEnum.Completed;
    //       q.query_job_id = null;
    //       q.data = data.rows;
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
    //   .catch(async e => {
    //     // common.logToConsole('error');
    //     // common.logToConsole(error);

    //     let q = await this.queriesRepository.findOne({
    //       query_id: query.query_id,
    //       query_job_id: queryJobId
    //     });

    //     if (common.isDefined(q)) {
    //       q.status = common.QueryStatusEnum.Error;
    //       q.data = [];
    //       q.query_job_id = null;
    //       q.last_error_message = e.message;
    //       q.last_error_ts = helper.makeTs();

    //       await this.dbService.writeRecords({
    //         modify: true,
    //         records: {
    //           queries: [q]
    //         }
    //       });
    //     }
    //   });

    return query;
  }

  async catchA(item: { query: any; queryJobId: any; e: any }) {
    let { query, queryJobId, e } = item;

    let q = await this.queriesRepository.findOne({
      query_id: query.query_id,
      query_job_id: queryJobId
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
  }

  async resultA(item: { query: any; queryJobId: any; data: any }) {
    let { query, queryJobId, data } = item;

    let q = await this.queriesRepository.findOne({
      query_id: query.query_id,
      query_job_id: queryJobId
    });

    if (common.isDefined(q)) {
      q.status = common.QueryStatusEnum.Completed;
      q.query_job_id = null;
      q.data = data.rows;
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
  }

  disconnectA(snowflakeConnection: snowflake.Connection) {
    snowflakeConnection.destroy(function (err, conn) {
      if (err) {
        console.error('Unable to disconnect: ' + err.message);
      } else {
        console.log(
          'Disconnected connection with id: ' + snowflakeConnection.getId()
        );
      }
    });
  }
}
