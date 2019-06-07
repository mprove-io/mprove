import { api } from '../../barrels/api';
import { entities } from '../../barrels/entities';
import { runQueryWithoutDepsBigquery } from './run-query-without-deps-bigquery';
import { runQueryWithoutDepsPostgres } from './run-query-without-deps-postgres';

export async function runQueryWithoutDeps(item: {
  project: entities.ProjectEntity;
  credentials_file_path: string;
  bigquery_project: string;
  user_id: string;
  query: entities.QueryEntity;
  new_last_run_ts: string;
}) {
  let query;

  if (item.project.connection === api.ProjectConnectionEnum.BigQuery) {
    query = await runQueryWithoutDepsBigquery({
      project: item.project,
      credentials_file_path: item.credentials_file_path,
      bigquery_project: item.bigquery_project,
      user_id: item.user_id,
      query: item.query,
      new_last_run_ts: item.new_last_run_ts
    });
  } else if (item.project.connection === api.ProjectConnectionEnum.PostgreSQL) {
    query = await runQueryWithoutDepsPostgres({
      project: item.project,
      user_id: item.user_id,
      query: item.query,
      new_last_run_ts: item.new_last_run_ts
    });
  }

  return query;
}
