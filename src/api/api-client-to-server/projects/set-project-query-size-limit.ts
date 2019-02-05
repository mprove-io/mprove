import * as apiObjects from '../../objects/_index';

export interface SetProjectQuerySizeLimitRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    query_size_limit: number;
    server_ts: number;
  };
}

export interface SetProjectQuerySizeLimitResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    project: apiObjects.Project;

  };
}
