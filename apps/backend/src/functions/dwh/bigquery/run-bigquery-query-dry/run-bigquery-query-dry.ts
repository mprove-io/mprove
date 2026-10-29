import { BigQuery, type JobResponse } from '@google-cloud/bigquery';
import type {
  ConnectionTab,
  QueryTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { QueryEstimate } from '#common/types/backend/parts/query-estimate';

export type RunBigqueryQueryDryOutput = {
  validEstimate?: QueryEstimate;
  errorQuery?: QueryTab;
};

export async function runBigqueryQueryDry(item: {
  query: QueryTab;
  connection: ConnectionTab;
}): Promise<RunBigqueryQueryDryOutput> {
  let { query, connection } = item;

  let validEstimate: QueryEstimate;

  let errorQuery: QueryTab;

  let bigquery: BigQuery = new BigQuery({
    credentials: connection.options.bigquery.serviceAccountCredentials,
    projectId: connection.options.bigquery.googleCloudProject
  });

  let createQueryJobItem: void | JobResponse = await bigquery
    .createQueryJob({
      destination: undefined,
      dryRun: true,
      useLegacySql: false,
      query: query.sql
    })
    .catch(e => {
      query.status = 'Error';
      query.data = [];
      query.lastErrorMessage = e.message;
      query.lastErrorTs = makeTsNumber();

      errorQuery = query;
    });

  if (isDefined(createQueryJobItem)) {
    let createQueryJobApiResponse = (createQueryJobItem as JobResponse)[1];

    let estimate: number = Number(
      createQueryJobApiResponse.statistics.totalBytesProcessed
    );

    validEstimate = {
      queryId: query.queryId,
      estimate: estimate,
      lastRunDryTs: makeTsNumber()
    };
  }

  let runBigqueryQueryDryOutput: RunBigqueryQueryDryOutput = {
    validEstimate: validEstimate,
    errorQuery: errorQuery
  };

  return runBigqueryQueryDryOutput;
}
