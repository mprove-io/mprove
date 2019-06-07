import { api } from '../../barrels/api';
import { constants } from '../../barrels/constants';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';

export function makeProject(item: {
  project_id: string;
}): entities.ProjectEntity {
  return {
    project_id: item.project_id,
    connection: api.ProjectConnectionEnum.BigQuery,
    postgres_host: undefined,
    postgres_port: undefined,
    postgres_database: undefined,
    postgres_user: undefined,
    postgres_password: undefined,
    has_credentials: enums.bEnum.FALSE,
    bigquery_project: undefined,
    bigquery_client_email: undefined,
    bigquery_credentials: undefined,
    bigquery_credentials_file_path: undefined,
    query_size_limit: constants.PROJECT_DEFAULT_QUERY_SIZE_LIMIT,
    week_start: api.ProjectWeekStartEnum.Sunday,
    timezone: constants.PROJECT_DEFAULT_TIMEZONE,
    deleted: enums.bEnum.FALSE,
    server_ts: undefined
  };
}
