import * as apiEnums from '../../../enums/_index';

export interface SetProjectWeekStartRequestBodyPayload {
  project_id: string;
  week_start: apiEnums.ProjectWeekStartEnum;
  server_ts: number;
}
