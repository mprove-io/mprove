import * as api from '../../../_index';

export interface PushRepoResponse200BodyPayload {
  deleted_prod_files: api.CatalogFile[];
  changed_prod_files: api.CatalogFile[];
  new_prod_files: api.CatalogFile[];
  prod_struct: api.Struct;
  dev_repo: api.Repo;
}
