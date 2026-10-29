import {
  BigQuery,
  type BigQueryOptions,
  type JobResponse
} from '@google-cloud/bigquery';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import { optionsToBigqueryOptions } from '#backend/functions/dwh/bigquery/options-to-bigquery-options/options-to-bigquery-options';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function runBigqueryQuery(item: {
  userId: string;
  query: QueryTab;
  connection: ConnectionTab;
}): Promise<QueryTab> {
  let { query, userId, connection } = item;

  let bigqueryConnectionOptions: BigQueryOptions = optionsToBigqueryOptions({
    connection: connection
  });

  let bigquery: BigQuery = new BigQuery(bigqueryConnectionOptions);

  query.lastRunBy = userId;
  query.lastRunTs = makeTsNumber();
  query.bigqueryQueryJobId = null;
  query.bigqueryConsecutiveErrorsGetJob = 0;
  query.bigqueryConsecutiveErrorsGetResults = 0;

  let maximumBytesBilled =
    connection.options.bigquery.bigqueryQuerySizeLimitGb * 1024 * 1024 * 1024;

  let createQueryJobItem: void | JobResponse = await bigquery
    .createQueryJob({
      destination: undefined,
      dryRun: false,
      useLegacySql: false,
      query: query.sql,
      maximumBytesBilled: maximumBytesBilled.toString()
    })
    .catch(e => {
      query.status = 'Error';
      query.data = [];
      query.lastErrorMessage = e.message;
      query.lastErrorTs = makeTsNumber();
    });

  if (isDefined(createQueryJobItem)) {
    let queryJob = (createQueryJobItem as JobResponse)[0];

    let createQueryJobApiResponse = (createQueryJobItem as JobResponse)[1];

    query.status = 'Running';
    query.bigqueryQueryJobId = queryJob.id;
  }

  return query;
}
