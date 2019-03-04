import * as apiObjects from '../../objects/_index';

export interface LoginUserRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    user_id: string;
    password: string;
  };
}

export interface LoginUserResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    email_verified: boolean;
    token?: string;
    user_id?: string;
  };
}
