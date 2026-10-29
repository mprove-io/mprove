import type { BigQueryOptions } from '@google-cloud/bigquery';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';

export function optionsToBigqueryOptions(item: {
  connection: ConnectionTab;
}): BigQueryOptions {
  let { connection } = item;

  let connectionOptions: BigQueryOptions = {
    credentials: connection.options.bigquery.serviceAccountCredentials,
    projectId: connection.options.bigquery.googleCloudProject
  };

  return connectionOptions;
}
