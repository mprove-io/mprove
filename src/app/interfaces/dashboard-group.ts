import * as api from 'app/api/_index';

export interface DashboardGroup {
  gr: string;
  dashboards: api.Dashboard[];
}
