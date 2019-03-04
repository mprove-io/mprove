import * as apiObjects from '../objects/_index';
import * as apiEnums from '../enums/_index';

export interface ProcessDashboardRequestBody {
  info: apiObjects.ServerRequestToBlockml;
  payload: {
    project_id: string;
    repo_id: string;
    bigquery_project: string;
    week_start: apiEnums.ProjectWeekStartEnum;
    old_dashboard_content: string;
    udfs_content: string;
    new_dashboard_id: string;
    new_dashboard_fields: apiObjects.DashboardField[];
    cuts: apiObjects.Cut[];
    struct_id: string;
  };
}

export interface ProcessDashboardResponse200Body {
  info: apiObjects.BlockmlResponse;
  payload: {
    dashboard: apiObjects.Dashboard;
    mconfigs: apiObjects.Mconfig[];
    queries: apiObjects.Query[];
  };
}
