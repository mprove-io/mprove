import * as apiObjects from '../../objects/_index';

export interface CreateDashboardRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    repo_id: string;
    old_dashboard_id: string;
    new_dashboard_id: string;
    new_dashboard_fields: apiObjects.DashboardField[];
  };
}

export interface CreateDashboardResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    dashboard: apiObjects.Dashboard;
    dashboard_mconfigs: apiObjects.Mconfig[];
    dashboard_queries: apiObjects.Query[];
  };
}
