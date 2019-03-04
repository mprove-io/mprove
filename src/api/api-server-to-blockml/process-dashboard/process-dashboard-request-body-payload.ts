import * as apiObjects from '../../objects/_index';
import * as apiEnums from '../../enums/_index';

export interface ProcessDashboardRequestBodyPayload {
  project_id: string;
  repo_id: string;
  bq_project: string;
  week_start: apiEnums.ProjectWeekStartEnum;
  old_dashboard_content: string;
  udfs_content: string;
  new_dashboard_id: string;
  new_dashboard_fields: apiObjects.DashboardField[];
  cuts: apiObjects.Cut[];
  struct_id: string;
}
