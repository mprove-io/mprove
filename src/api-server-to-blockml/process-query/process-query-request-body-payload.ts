import * as api from '../../_index';

export interface ProcessQueryRequestBodyPayload {
  project_id: string;
  bq_project: string;
  week_start: api.ProjectWeekStartEnum;
  mconfig: api.Mconfig;
  model_content: string;
  udfs_content: string;
  struct_id: string;
}
