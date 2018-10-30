import * as api from '../../_index';

export interface MultiCreateDashboardRequestBodyPayload {
  project_id: string;
  repo_id: string;
  old_dashboard_id: string;
  new_dashboard_id: string;
  new_dashboard_fields: api.DashboardField[];
}
