import * as apiObjects from '../../objects/_index';

export interface RegenerateRepoRemoteWebhookRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    repo_id: string;
    server_ts: number;
  };
}

export interface RegenerateRepoRemoteWebhookResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    dev_repo: apiObjects.Repo;
  };
}
