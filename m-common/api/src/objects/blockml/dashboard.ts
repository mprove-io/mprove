import { DashboardField } from './dashboard-field';
import { Report } from './report';

export class Dashboard {
  projectId: string;
  repoId: string;
  structId: string;
  dashboardId: string;
  content: string;
  accessUsers: string[];
  title: string;
  gr?: string;
  hidden: boolean;
  fields: DashboardField[];
  reports: Report[];
  temp: boolean;
  description?: string;
  serverTs: number;
}
