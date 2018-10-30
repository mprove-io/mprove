import * as api from '../../_index';

export interface ProcessDashboardResponse200BodyPayload {
  dashboard: api.Dashboard;
  mconfigs: api.Mconfig[];
  queries: api.Query[];
}
