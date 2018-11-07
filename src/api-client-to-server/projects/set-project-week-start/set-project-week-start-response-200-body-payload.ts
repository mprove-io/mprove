import * as apiObjects from '../../../objects/_index';

export interface SetProjectWeekStartResponse200BodyPayload {
  project: apiObjects.Project;
  dev_struct: apiObjects.Struct;
  prod_struct: apiObjects.Struct;
}
