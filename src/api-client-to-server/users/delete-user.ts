import * as apiObjects from '../../objects/_index';

export interface DeleteUserRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    user_id: string;
    server_ts: number;
  };
}

export interface DeleteUserResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    deleted_user: apiObjects.User;
  };
}
