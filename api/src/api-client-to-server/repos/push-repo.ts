import * as apiObjects from '../../objects/_index';

export interface PushRepoRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    repo_id: string;
    server_ts: number;
  };
}

export interface PushRepoResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    deleted_prod_files: apiObjects.CatalogFile[];
    changed_prod_files: apiObjects.CatalogFile[];
    new_prod_files: apiObjects.CatalogFile[];
    prod_struct: apiObjects.Struct;
    dev_repo: apiObjects.Repo;
  };
}
