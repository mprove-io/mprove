import { BigQuery } from '@google-cloud/bigquery';
import { Injectable } from '@nestjs/common';
import asyncPool from 'tiny-async-pool';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';
import { ConnectionsService } from './connections.service';

@Injectable()
export class QueriesService {
  constructor(
    private queriesRepository: repositories.QueriesRepository,
    private connectionsService: ConnectionsService
  ) {}

  async getQueryCheckExists(item: { queryId: string }) {
    let { queryId: queryId } = item;

    let query = await this.queriesRepository.findOne({
      query_id: queryId
    });

    if (common.isUndefined(query)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_QUERY_DOES_NOT_EXIST
      });
    }

    return query;
  }

  async checkRunningQueries() {
    let bigqueryRunningQueries = await this.queriesRepository.find({
      status: common.QueryStatusEnum.Running,
      connection_type: common.ConnectionTypeEnum.BigQuery
    });

    await asyncPool(8, bigqueryRunningQueries, async query => {
      let connection = await this.connectionsService.getConnectionCheckExists({
        projectId: query.project_id,
        connectionId: query.connection_id
      });

      let bigquery = new BigQuery({
        credentials: connection.bigquery_credentials,
        projectId: connection.bigquery_project
      });

      let bigqueryQueryJob = bigquery.job(query.bigquery_query_job_id);

      let itemQueryJob = await bigqueryQueryJob.get();
      // .catch((e: any) =>
      //   helper.reThrow(e, enums.bigqueryErrorsEnum.BIGQUERY_JOB_GET)
      // );

      let queryJob = itemQueryJob[0];
      let queryJobGetResponse: any = itemQueryJob[1];

      // if (queryJobGetResponse.status.state === 'DONE') {
      //   if (queryJobGetResponse.status.errorResult) {
      //     // QUERY FAIL

      //     let newLastErrorTs = helper.makeTs();

      //     let errorResult = queryJobGetResponse.status.errorResult;

      //     query.status = api.QueryStatusEnum.Error;
      //     query.refresh = null;
      //     query.last_error_message =
      //       `Query fail. ` +
      //       `Message: '${errorResult.message}'. ` +
      //       `Reason: '${errorResult.reason}'. ` +
      //       `Location: '${errorResult.location}'.`;
      //     query.last_error_ts = newLastErrorTs;
      //   }
      // else {
      //     // QUERY SUCCESS

      //     let data: string;

      //     if (query.is_pdt === enums.bEnum.TRUE) {
      //       // bigquery_is_copying false

      //       let copyJobId = await copyQueryResultsToPdt({
      //         query: query,
      //         bigquery: bigquery
      //       }).catch((e: any) =>
      //         helper.reThrow(e, enums.procErrorsEnum.PROC_COPY_QUERY_RESULTS_TO_PDT)
      //       );

      //       query.bigquery_is_copying = enums.bEnum.TRUE;
      //       query.bigquery_copy_job_id = copyJobId;
      //       // don't change query.server_ts and don't notify client
      //     } else {
      //       let queryResultsItem = await queryJob
      //         .getQueryResults()
      //         .catch((e: any) =>
      //           helper.reThrow(
      //             e,
      //             enums.bigqueryErrorsEnum.BIGQUERY_JOB_GET_QUERY_RESULTS
      //           )
      //         );

      //       let rows = queryResultsItem[0];

      //       data = JSON.stringify(rows);

      //       let newLastCompleteTs = helper.makeTs();

      //       let newLastCompleteDuration = Math.floor(
      //         (Number(newLastCompleteTs) - Number(query.last_run_ts)) / 1000
      //       ).toString();

      //       query.status = api.QueryStatusEnum.Completed;
      //       query.refresh = null;
      //       query.data = data;
      //       query.last_complete_ts = newLastCompleteTs;
      //       query.last_complete_duration = newLastCompleteDuration;
      //     }
      //   }
      // }
    });
  }
}
