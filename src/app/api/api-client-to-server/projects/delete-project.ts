import * as apiObjects from '../../objects/_index';

export interface DeleteProjectRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    server_ts: number;
  };
}

export interface DeleteProjectResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    deleted_project: apiObjects.Project;

  };
}
