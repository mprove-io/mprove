import * as api from '../../../_index';

export interface SetProjectCredentialsResponse200BodyPayload {
  project: api.Project;
  dev_and_prod_structs_or_empty: api.Struct[];
}
