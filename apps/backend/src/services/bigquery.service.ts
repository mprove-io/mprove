import { BigQuery, JobResponse } from '@google-cloud/bigquery';
import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { makeTsNumber } from '~backend/functions/make-ts-number';

@Injectable()
export class BigQueryService {
  constructor() {}

  async runQuery(item: {
    userId: string;
    query: schemaPostgres.QueryEnt;
    connection: schemaPostgres.ConnectionEnt;
  }) {
    let { query, userId, connection } = item;

    let bigquery = new BigQuery({
      credentials: connection.bigqueryCredentials,
      projectId: connection.bigqueryProject
    });

    query.lastRunBy = userId;
    query.lastRunTs = makeTsNumber();
    query.bigqueryQueryJobId = null;
    query.bigqueryConsecutiveErrorsGetJob = 0;
    query.bigqueryConsecutiveErrorsGetResults = 0;

    let maximumBytesBilled =
      connection.bigqueryQuerySizeLimitGb * 1024 * 1024 * 1024;

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
        query.data = [];
        query.lastErrorMessage = e.message;
        query.lastErrorTs = makeTsNumber();
      });

    if (common.isDefined(createQueryJobItem)) {
      let queryJob = (createQueryJobItem as JobResponse)[0];
      let createQueryJobApiResponse = (createQueryJobItem as JobResponse)[1];

      query.status = common.QueryStatusEnum.Running;
      query.bigqueryQueryJobId = queryJob.id;
    }

    return query;
  }

  async runQueryDry(item: {
    query: schemaPostgres.QueryEnt;
    connection: schemaPostgres.ConnectionEnt;
  }) {
    let { query, connection } = item;

    let validEstimate: common.QueryEstimate;
    let errorQuery: schemaPostgres.QueryEnt;

    let bigquery = new BigQuery({
      credentials: connection.bigqueryCredentials,
      projectId: connection.bigqueryProject
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
        query.data = [];
        query.lastErrorMessage = e.message;
        query.lastErrorTs = makeTsNumber();

        errorQuery = query;
      });

    if (common.isDefined(createQueryJobItem)) {
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
