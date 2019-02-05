import * as apiObjects from '../../objects/_index';

export interface RegenerateRepoRemotePublicKeyRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    repo_id: string;
    server_ts: number;
  };
}

export interface RegenerateRepoRemotePublicKeyResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    dev_repo: apiObjects.Repo;
  };
}
