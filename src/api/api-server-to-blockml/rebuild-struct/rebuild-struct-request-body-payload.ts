import * as apiObjects from '../../objects/_index';
import * as apiEnums from '../../enums/_index';

export interface RebuildStructRequestBodyPayload {
  files: apiObjects.File[];
  project_id: string;
  repo_id: string;
  bq_project: string;
  week_start: apiEnums.ProjectWeekStartEnum;
  struct_id: string;
}
