import * as apiEnums from '../../enums/_index';

export interface RebuildStructRequestBodyPayload {
  project_id: string;
  repo_id: string;
  bq_project: string;
  week_start: apiEnums.ProjectWeekStartEnum;
  struct_id: string;
}
