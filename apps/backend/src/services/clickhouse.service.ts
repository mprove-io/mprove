import {
  ClickHouseClient,
  ClickHouseClientOptions,
  ClickHouseConnectionProtocol
} from '@depyronick/clickhouse-client';
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
    connection: entities.ConnectionEntity;
    queryJobId: string;
    queryId: string;
    querySql: string;
    projectId: string;
  }) {
    let { connection, queryJobId, queryId, querySql, projectId } = item;

    let options: ClickHouseClientOptions = {
      protocol:
        connection.is_ssl === common.BoolEnum.TRUE
          ? ClickHouseConnectionProtocol.HTTPS
          : ClickHouseConnectionProtocol.HTTP,
      host: connection.host,
      port: connection.port,
      username: connection.username,
      password: connection.password
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
          let q = await this.queriesRepository.findOne({
            where: {
              query_id: queryId,
              query_job_id: queryJobId,
              project_id: projectId
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

            resolve();
          }
        },
        error: async (e: any) => {
          let q = await this.queriesRepository.findOne({
            where: {
              query_id: queryId,
              query_job_id: queryJobId,
              project_id: projectId
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

            resolve();
          }
        }
      });
    });
  }
}
