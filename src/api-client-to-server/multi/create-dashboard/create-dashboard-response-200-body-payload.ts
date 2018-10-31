import * as api from '../../../_index';

export interface CreateDashboardResponse200BodyPayload {
  dashboard: api.Dashboard;
  dashboard_mconfigs: api.Mconfig[];
  dashboard_queries: api.Query[];
}
