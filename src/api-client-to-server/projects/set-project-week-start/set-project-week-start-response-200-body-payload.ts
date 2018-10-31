import * as api from '../../../_index';

export interface SetProjectWeekStartResponse200BodyPayload {
  project: api.Project;
  dev_struct: api.Struct;
  prod_struct: api.Struct;
}
