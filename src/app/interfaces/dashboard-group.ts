import * as api from 'src/app/api/_index';

export interface DashboardGroup {
  gr: string;
  dashboards: api.Dashboard[];
}
