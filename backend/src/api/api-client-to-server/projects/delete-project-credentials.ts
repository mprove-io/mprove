import * as apiObjects from '../../objects/_index';

export interface DeleteProjectCredentialsRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    server_ts: number;
  };
}

export interface DeleteProjectCredentialsResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    project: apiObjects.Project;
  };
}
