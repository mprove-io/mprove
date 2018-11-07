import * as apiObjects from '../../objects/_index';

export interface ProcessDashboardResponse200BodyPayload {
  dashboard: apiObjects.Dashboard;
  mconfigs: apiObjects.Mconfig[];
  queries: apiObjects.Query[];
}
