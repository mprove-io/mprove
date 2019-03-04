import * as apiObjects from '../../../objects/_index';

export interface CreateDashboardResponse200BodyPayload {
  dashboard: apiObjects.Dashboard;
  dashboard_mconfigs: apiObjects.Mconfig[];
  dashboard_queries: apiObjects.Query[];
}
