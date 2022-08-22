import { BigQuery } from '@google-cloud/bigquery';
import { Injectable } from '@nestjs/common';
import asyncPool from 'tiny-async-pool';
import { Connection, In } from 'typeorm';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { DbService } from '~backend/services/db.service';

@Injectable()
export class QueriesService {
  constructor(
    private queriesRepository: repositories.QueriesRepository,
    private connectionsRepository: repositories.ConnectionsRepository,
    private dbService: DbService,
    private connection: Connection
  ) {}

  async getQueryCheckExists(item: { queryId: string }) {
    let { queryId: queryId } = item;

    let query = await this.queriesRepository.findOne({
      query_id: queryId
    });

    if (common.isUndefined(query)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_QUERY_DOES_NOT_EXIST
      });
    }

    return query;
  }

  async removeOrphanedQueries() {
    let rawData: any;

    await this.connection.transaction(async manager => {
      rawData = await manager.query(`
SELECT 
  q.query_id
FROM queries as q 
LEFT JOIN mconfigs as m ON q.query_id=m.query_id 
WHERE m.mconfig_id is NULL
`);
    });

    let orphanedQueryIds: string[] = rawData?.map((x: any) => x.query_id) || [];

    if (orphanedQueryIds.length > 0) {
      await this.queriesRepository.delete({ query_id: In(orphanedQueryIds) });
    }
  }

  async checkBigqueryRunningQueries() {
    let queries = await this.queriesRepository.find({
      status: common.QueryStatusEnum.Running,
      connection_type: common.ConnectionTypeEnum.BigQuery
    });

    await asyncPool(8, queries, async (query: entities.QueryEntity) => {
      try {
        let connection = await this.connectionsRepository.findOne({
          project_id: query.project_id,
          connection_id: query.connection_id
        });

        if (common.isUndefined(connection)) {
          query.status = common.QueryStatusEnum.Error;
          query.data = [];
          query.last_error_message = `Project connection not found`;
          query.last_error_ts = helper.makeTs();

          await this.dbService.writeRecords({
            modify: true,
            records: {
              queries: [query]
            }
          });
          return;
        }

        let bigquery = new BigQuery({
          credentials: connection.bigquery_credentials,
          projectId: connection.bigquery_project
        });

        let bigqueryQueryJob = bigquery.job(query.bigquery_query_job_id);

        let itemQueryJob = await bigqueryQueryJob
          .get()
          .catch(async (e: any) => {
            if (query.bigquery_consecutive_errors_get_job > 2) {
              query.status = common.QueryStatusEnum.Error;
              query.data = [];
              query.last_error_message = `Bigquery get Job fail`;
              query.last_error_ts = helper.makeTs();
            } else {
              query.bigquery_consecutive_errors_get_job =
                query.bigquery_consecutive_errors_get_job + 1;
            }

            await this.dbService.writeRecords({
              modify: true,
              records: {
                queries: [query]
              }
            });
            return;
          });

        query.bigquery_consecutive_errors_get_job = 0;
        await this.dbService.writeRecords({
          modify: true,
          records: {
            queries: [query]
          }
        });

        let queryJob = (itemQueryJob as any)[0];
        let queryJobGetResponse: any = (itemQueryJob as any)[1];

        if (queryJobGetResponse.status.state === 'DONE') {
          if (queryJobGetResponse.status.errorResult) {
            let errorResult = queryJobGetResponse.status.errorResult;

            query.status = common.QueryStatusEnum.Error;
            query.data = [];
            query.last_error_message =
              `Query fail. ` +
              `Message: '${errorResult.message}'. ` +
              `Reason: '${errorResult.reason}'. ` +
              `Location: '${errorResult.location}'.`;
            query.last_error_ts = helper.makeTs();

            await this.dbService.writeRecords({
              modify: true,
              records: {
                queries: [query]
              }
            });
          } else {
            let queryResultsItem = await queryJob
              .getQueryResults()
              .catch(async (e: any) => {
                if (query.bigquery_consecutive_errors_get_results > 2) {
                  query.status = common.QueryStatusEnum.Error;
                  query.data = [];
                  query.last_error_message = `Bigquery get QueryResults fail`;
                  query.last_error_ts = helper.makeTs();
                } else {
                  query.bigquery_consecutive_errors_get_results =
                    query.bigquery_consecutive_errors_get_results + 1;
                }

                await this.dbService.writeRecords({
                  modify: true,
                  records: {
                    queries: [query]
                  }
                });
                return;
              });

            let newLastCompleteTs = helper.makeTs();
            let newLastCompleteDuration = Math.floor(
              (Number(newLastCompleteTs) - Number(query.last_run_ts)) / 1000
            ).toString();

            query.status = common.QueryStatusEnum.Completed;
            // no need for query.bigquery_consecutive_errors_get_results = 0
            // because status change to Completed
            query.data = queryResultsItem[0];
            query.last_complete_ts = newLastCompleteTs;
            query.last_complete_duration = newLastCompleteDuration;

            await this.dbService.writeRecords({
              modify: true,
              records: {
                queries: [query]
              }
            });
          }
        }
      } catch (e) {
        let serverError = new common.ServerError({
          message: common.ErEnum.BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERY,
          originalError: e
        });

        common.logToConsole(serverError);
      }
    });
  }
}
