import * as apiObjects from '../../objects/_index';

export interface SetUserNameRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    first_name: string;
    last_name: string;
    server_ts: number;
  };
}

export interface SetUserNameResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    user: apiObjects.User;
    members: apiObjects.Member[];
  };
}
