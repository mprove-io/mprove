import * as apiObjects from '../../../objects/_index';

export interface PushRepoResponse200BodyPayload {
  deleted_prod_files: apiObjects.CatalogFile[];
  changed_prod_files: apiObjects.CatalogFile[];
  new_prod_files: apiObjects.CatalogFile[];
  prod_struct: apiObjects.Struct;
  dev_repo: apiObjects.Repo;
}
