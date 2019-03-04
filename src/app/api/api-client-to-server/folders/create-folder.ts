import * as apiObjects from '../../objects/_index';

export interface CreateFolderRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    repo_id: string;
    node_id: string;
    name: string;
  };
}

export interface CreateFolderResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    dev_repo: apiObjects.Repo;
  };
}
