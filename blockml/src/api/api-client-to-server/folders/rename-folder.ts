import * as apiObjects from '../../objects/_index';

export interface RenameFolderRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    repo_id: string;
    node_id?: string;
    new_name: string;
    repo_server_ts: number;
  };
}

export interface RenameFolderResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    deleted_folder_dev_files: apiObjects.CatalogFile[];
    new_folder_dev_files: apiObjects.CatalogFile[];
    dev_struct: apiObjects.Struct;
  };
}
