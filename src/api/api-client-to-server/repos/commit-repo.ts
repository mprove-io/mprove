import * as apiObjects from '../../objects/_index';

export interface CommitRepoRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    repo_id: string;
    server_ts: number;
  };
}

export interface CommitRepoResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    dev_repo: apiObjects.Repo;
  };
}
