import * as apiObjects from '../../objects/_index';

export interface GetDashboardMconfigsQueriesRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    repo_id: string;
    dashboard_id: string;
  };
}

export interface GetDashboardMconfigsQueriesResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    dashboard_or_empty: apiObjects.Dashboard[];
    dashboard_mconfigs: apiObjects.Mconfig[];
    dashboard_queries: apiObjects.Query[];
  };
}
