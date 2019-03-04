import * as apiObjects from '../../objects/_index';

export interface SetUserTimezoneRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    timezone: string;
    server_ts: number;
  };
}

export interface SetUserTimezoneResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    user: apiObjects.User;
  };
}
