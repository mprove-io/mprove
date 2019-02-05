import * as apiObjects from '../../objects/_index';

export interface RegisterUserRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    user_id: string;
    password: string;
  };
}

export interface RegisterUserResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    user_id: string;

  };
}
