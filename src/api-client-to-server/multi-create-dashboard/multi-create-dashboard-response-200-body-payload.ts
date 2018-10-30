import * as api from '../../_index';

export interface MultiCreateDashboardResponse200BodyPayload {
  dashboard: api.Dashboard;
  dashboard_mconfigs: api.Mconfig[];
  dashboard_queries: api.Query[];
}
