import * as apiObjects from '../../objects/_index';

export interface UpdateUserPasswordRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    token: string;
    password: string;
  };
}

export interface UpdateUserPasswordResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    empty: boolean;
  };
}
