import { BigQuery, JobResponse } from '@google-cloud/bigquery';
import { Injectable } from '@nestjs/common';
import { QueryTab } from '~backend/drizzle/postgres/schema/_tabs';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { isDefined } from '~common/functions/is-defined';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { QueryEstimate } from '~common/interfaces/backend/query-estimate';

@Injectable()
export class BigQueryService {
  constructor() {}

  async runQuery(item: {
    userId: string;
    query: QueryTab;
    connection: ProjectConnection;
  }): Promise<QueryTab> {
    let { query, userId, connection } = item;

    let bigquery = new BigQuery({
      credentials: connection.options.bigquery.serviceAccountCredentials,
      projectId: connection.options.bigquery.googleCloudProject
    });

    query.lastRunBy = userId;
    query.lastRunTs = makeTsNumber();
    query.bigqueryQueryJobId = null;
    query.bigqueryConsecutiveErrorsGetJob = 0;
    query.bigqueryConsecutiveErrorsGetResults = 0;

    let maximumBytesBilled =
      connection.options.bigquery.bigqueryQuerySizeLimitGb * 1024 * 1024 * 1024;

    let createQueryJobItem = await bigquery
      .createQueryJob({
        destination: undefined,
        dryRun: false,
        useLegacySql: false,
        query: query.sql,
        maximumBytesBilled: maximumBytesBilled.toString()
      })
      .catch(e => {
        query.status = QueryStatusEnum.Error;
        query.data = [];
        query.lastErrorMessage = e.message;
        query.lastErrorTs = makeTsNumber();
      });

    if (isDefined(createQueryJobItem)) {
      let queryJob = (createQueryJobItem as JobResponse)[0];
      let createQueryJobApiResponse = (createQueryJobItem as JobResponse)[1];

      query.status = QueryStatusEnum.Running;
      query.bigqueryQueryJobId = queryJob.id;
    }

    return query;
  }

  async runQueryDry(item: {
    query: QueryTab;
    connection: ProjectConnection;
  }) {
    let { query, connection } = item;

    let validEstimate: QueryEstimate;
    let errorQuery: QueryTab;

    let bigquery = new BigQuery({
      credentials: connection.options.bigquery.serviceAccountCredentials,
      projectId: connection.options.bigquery.googleCloudProject
    });

    let createQueryJobItem = await bigquery
      .createQueryJob({
        destination: undefined,
        dryRun: true,
        useLegacySql: false,
        query: query.sql
      })
      .catch(e => {
        query.status = QueryStatusEnum.Error;
        query.data = [];
        query.lastErrorMessage = e.message;
        query.lastErrorTs = makeTsNumber();

        errorQuery = query;
      });

    if (isDefined(createQueryJobItem)) {
      let createQueryJobApiResponse = (createQueryJobItem as JobResponse)[1];

      let estimate = Number(
        createQueryJobApiResponse.statistics.totalBytesProcessed
      );

      validEstimate = {
        queryId: query.queryId,
        estimate: estimate,
        lastRunDryTs: makeTsNumber()
      };
    }

    return {
      validEstimate: validEstimate,
      errorQuery: errorQuery
    };
  }
}
