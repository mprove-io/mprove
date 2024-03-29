import { BigQuery } from '@google-cloud/bigquery';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { DataSource, In } from 'typeorm';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { DbService } from '~backend/services/db.service';

@Injectable()
export class QueriesService {
  constructor(
    private queriesRepository: repositories.QueriesRepository,
    private connectionsRepository: repositories.ConnectionsRepository,
    private dbService: DbService,
    private cs: ConfigService<interfaces.Config>,
    private dataSource: DataSource,
    private logger: Logger
  ) {}

  async getQueryCheckExistsSkipData(item: {
    queryId: string;
    projectId: string;
  }) {
    let { queryId: queryId, projectId: projectId } = item;

    let query = await this.queriesRepository.findOne({
      select: [
        'project_id',
        'env_id',
        'connection_id',
        'connection_type',
        'query_id',
        'sql',
        'status',
        // 'data',
        'last_run_by',
        'last_run_ts',
        'last_cancel_ts',
        'last_complete_ts',
        'last_complete_duration',
        'last_error_message',
        'last_error_ts',
        'query_job_id',
        'bigquery_query_job_id',
        'bigquery_consecutive_errors_get_job',
        'bigquery_consecutive_errors_get_results',
        'server_ts'
      ],
      where: {
        query_id: queryId,
        project_id: projectId
      }
    });

    if (common.isUndefined(query)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_QUERY_DOES_NOT_EXIST
      });
    }

    return query;
  }

  async getQueryCheckExists(item: { queryId: string }) {
    let { queryId: queryId } = item;

    let query = await this.queriesRepository.findOne({
      where: {
        query_id: queryId
      }
    });

    if (common.isUndefined(query)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_QUERY_DOES_NOT_EXIST
      });
    }

    return query;
  }

  async getQueriesCheckExistSkipSqlData(item: {
    queryIds: string[];
    projectId: string;
  }) {
    let { queryIds, projectId } = item;

    let queries = await this.queriesRepository.find({
      select: [
        'project_id',
        'env_id',
        'connection_id',
        'connection_type',
        'query_id',
        // 'sql',
        'status',
        // 'data',
        'last_run_by',
        'last_run_ts',
        'last_cancel_ts',
        'last_complete_ts',
        'last_complete_duration',
        'last_error_message',
        'last_error_ts',
        'query_job_id',
        'bigquery_query_job_id',
        'bigquery_consecutive_errors_get_job',
        'bigquery_consecutive_errors_get_results',
        'server_ts'
      ],
      where: {
        query_id: In(queryIds),
        project_id: projectId
      }
    });

    let notFoundQueryIds: string[] = [];

    queryIds.forEach(x => {
      if (queries.map(query => query.query_id).indexOf(x) < -1) {
        notFoundQueryIds.push(x);
      }
    });

    if (notFoundQueryIds.length > 0) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_QUERIES_DO_NOT_EXIST,
        data: {
          notFoundQueryIds: notFoundQueryIds
        }
      });
    }

    return queries;
  }

  async removeOrphanedQueries() {
    let rawData: any;

    await this.dataSource.transaction(async manager => {
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
      where: {
        status: common.QueryStatusEnum.Running,
        connection_type: common.ConnectionTypeEnum.BigQuery
      }
    });

    await asyncPool(8, queries, async (query: entities.QueryEntity) => {
      try {
        let connection = await this.connectionsRepository.findOne({
          where: {
            project_id: query.project_id,
            connection_id: query.connection_id
          }
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
        logToConsoleBackend({
          log: new common.ServerError({
            message:
              common.ErEnum.BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERY,
            originalError: e
          }),
          logLevel: common.LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    });
  }
}
