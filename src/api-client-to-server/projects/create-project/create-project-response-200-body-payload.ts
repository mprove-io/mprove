import * as api from '../../../_index';

export interface CreateProjectResponse200BodyPayload {
  project: api.Project;
  member: api.Member;
  dev_files: api.CatalogFile[];
  prod_files: api.CatalogFile[];
  dev_struct: api.Struct;
  prod_struct: api.Struct;
}
