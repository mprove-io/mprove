import * as apiObjects from '../../../objects/_index';

export interface SetProjectCredentialsResponse200BodyPayload {
  project: apiObjects.Project;
  dev_and_prod_structs_or_empty: apiObjects.Struct[];
}
