import * as apiObjects from '../../objects/_index';

export interface CreateFileRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    repo_id: string;
    node_id: string;
    name: string;
  };
}

export interface CreateFileResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    dev_repo: apiObjects.Repo;
    created_dev_file: apiObjects.CatalogFile;
  };
}
