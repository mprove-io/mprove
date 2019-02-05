import * as apiObjects from '../../objects/_index';

export interface LogoutUserRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    empty: boolean;

  };
}

export interface LogoutUserResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    empty: boolean;

  };
}
