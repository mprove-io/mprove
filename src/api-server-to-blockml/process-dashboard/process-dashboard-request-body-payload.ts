import * as api from '../../_index';

export interface ProcessDashboardRequestBodyPayload {
  project_id: string;
  repo_id: string;
  bq_project: string;
  week_start: api.ProjectWeekStartEnum;
  old_dashboard_content: string;
  udfs_content: string;
  new_dashboard_id: string;
  new_dashboard_fields: api.DashboardField[];
  cuts: api.Cut[];
  struct_id: string;
}
