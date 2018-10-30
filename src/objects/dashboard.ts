import * as api from '../_index';

export interface Dashboard {
  project_id: string;
  repo_id: string;
  struct_id: string;
  dashboard_id: string;
  content: string;
  access_users: string[];
  title: string;
  gr?: string;
  hidden: boolean;
  fields: api.DashboardField[];
  reports: api.Report[];
  temp: boolean;
  server_ts: number;
  description?: string;
}
