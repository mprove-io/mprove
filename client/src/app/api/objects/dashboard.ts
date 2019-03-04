import { DashboardField } from './dashboard-field';
import { Report } from './report';

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
  fields: DashboardField[];
  reports: Report[];
  temp: boolean;
  server_ts: number;
  description?: string;
}
