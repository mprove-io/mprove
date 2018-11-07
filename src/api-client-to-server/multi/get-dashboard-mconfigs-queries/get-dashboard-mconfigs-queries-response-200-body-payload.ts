import * as apiObjects from '../../../objects/_index';

export interface GetDashboardMconfigsQueriesResponse200BodyPayload {
  dashboard_or_empty: apiObjects.Dashboard[];
  dashboard_mconfigs: apiObjects.Mconfig[];
  dashboard_queries: apiObjects.Query[];
}
