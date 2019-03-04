import * as apiObjects from '../../objects/_index';

export interface SetRepoRemoteUrlRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    repo_id: string;
    remote_url: string;
    server_ts: number;
  };
}

export interface SetRepoRemoteUrlResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    dev_repo: apiObjects.Repo;
  };
}
