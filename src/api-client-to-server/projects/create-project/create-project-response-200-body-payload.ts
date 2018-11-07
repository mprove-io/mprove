import * as apiObjects from '../../../objects/_index';

export interface CreateProjectResponse200BodyPayload {
  project: apiObjects.Project;
  member: apiObjects.Member;
  dev_files: apiObjects.CatalogFile[];
  prod_files: apiObjects.CatalogFile[];
  dev_struct: apiObjects.Struct;
  prod_struct: apiObjects.Struct;
}
