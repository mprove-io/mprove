import * as apiObjects from '../../objects/_index';

export interface SetProjectTimezoneRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    timezone: string;
    server_ts: number;
  };
}

export interface SetProjectTimezoneResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    project: apiObjects.Project;
  };
}
