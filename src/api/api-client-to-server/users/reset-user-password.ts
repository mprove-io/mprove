import * as apiObjects from '../../objects/_index';

export interface ResetUserPasswordRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    user_id: string;
    url: string;
  };
}

export interface ResetUserPasswordResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    user_id: string;
  };
}
