import * as api from '../../_index';

export interface ReposPushRepoResponse200BodyPayload {
  deleted_prod_files: api.CatalogFile[];
  changed_prod_files: api.CatalogFile[];
  new_prod_files: api.CatalogFile[];
  prod_struct: api.Struct;
  dev_repo: api.Repo;
}
