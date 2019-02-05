import * as apiObjects from '../../objects/_index';

export interface DeleteFolderRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    repo_id: string;
    node_id: string;
    repo_server_ts: number;
  };
}

export interface DeleteFolderResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    deleted_folder_dev_files: apiObjects.CatalogFile[];
    dev_struct: apiObjects.Struct;
  };
}
