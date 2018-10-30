import * as api from '../../_index';

export interface RebuildStructRequestBodyPayload {
  project_id: string;
  repo_id: string;
  bq_project: string;
  week_start: api.ProjectWeekStartEnum;
  struct_id: string;
}
