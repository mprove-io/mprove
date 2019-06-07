import * as apiEnums from '../enums/_index';

export interface Project {
  project_id: string;
  postgres_host: string;
  postgres_port: number;
  postgres_database: string;
  postgres_user: string;
  has_credentials: boolean;
  bigquery_project: string;
  client_email: string;
  query_size_limit: number;
  week_start: apiEnums.ProjectWeekStartEnum;
  connection: apiEnums.ProjectConnectionEnum;
  timezone: string;
  deleted: boolean;
  server_ts: number;
}
