import * as apiObjects from '../../objects/_index';

export interface PullRepoRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    repo_id: string;
    server_ts: number;
    from_remote: boolean;
  };
}

export interface PullRepoResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    deleted_dev_files: apiObjects.CatalogFile[];
    changed_dev_files: apiObjects.CatalogFile[];
    new_dev_files: apiObjects.CatalogFile[];
    dev_struct_or_empty: apiObjects.Struct[];
  };
}
