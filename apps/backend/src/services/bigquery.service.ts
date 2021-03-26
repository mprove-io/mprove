import { BigQuery } from '@google-cloud/bigquery';
import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { DbService } from '~backend/services/db.service';

@Injectable()
export class BigQueryService {
  constructor(private dbService: DbService) {}

  async runQuery(item: {
    userId: string;
    query: entities.QueryEntity;
    connection: entities.ConnectionEntity;
  }) {
    let { query, userId, connection } = item;

    let bigquery = new BigQuery({
      credentials: connection.bigquery_credentials,
      projectId: connection.bigquery_project
    });

    query.last_run_by = userId;
    query.last_run_ts = helper.makeTs();
    query.bigquery_query_job_id = null;
    query.bigquery_consecutive_errors_get_job = 0;
    query.bigquery_consecutive_errors_get_results = 0;

    let maximumBytesBilled =
      connection.bigquery_query_size_limit_gb * 1024 * 1024 * 1024;

    let createQueryJobItem = await bigquery
      .createQueryJob({
        destination: undefined,
        dryRun: false,
        useLegacySql: false,
        query: query.sql,
        maximumBytesBilled: maximumBytesBilled.toString()
      })
      .catch(e => {
        query.status = common.QueryStatusEnum.Error;
        query.last_error_message = e.message;
        query.last_error_ts = helper.makeTs();
      });

    if (common.isDefined(createQueryJobItem)) {
      let queryJob = createQueryJobItem[0];
      let createQueryJobApiResponse = createQueryJobItem[1];

      query.status = common.QueryStatusEnum.Running;
      query.bigquery_query_job_id = queryJob.id;
    }

    let records = await this.dbService.writeRecords({
      modify: true,
      records: {
        queries: [query]
      }
    });

    let recordsQuery = records.queries.find(x => x.query_id === query.query_id);

    return recordsQuery;
  }

  async runQueryDry(item: {
    query: entities.QueryEntity;
    connection: entities.ConnectionEntity;
  }) {
    let { query, connection } = item;

    let validEstimate: common.QueryEstimate;
    let errorQuery: entities.QueryEntity;

    let bigquery = new BigQuery({
      credentials: connection.bigquery_credentials,
      projectId: connection.bigquery_project
    });

    let createQueryJobItem = await bigquery
      .createQueryJob({
        destination: undefined,
        dryRun: true,
        useLegacySql: false,
        query: query.sql
      })
      .catch(e => {
        query.status = common.QueryStatusEnum.Error;
        query.last_error_message = e.message;
        query.last_error_ts = helper.makeTs();

        errorQuery = query;
      });

    if (common.isDefined(createQueryJobItem)) {
      let createQueryJobApiResponse = createQueryJobItem[1];

      let estimate = Number(
        createQueryJobApiResponse.statistics.totalBytesProcessed
      );

      validEstimate = {
        queryId: query.query_id,
        estimate: estimate,
        lastRunDryTs: helper.makeTs()
      };
    }

    return {
      validEstimate: validEstimate,
      errorQuery: errorQuery
    };
  }
}
