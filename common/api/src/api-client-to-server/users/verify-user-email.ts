import * as apiObjects from '../../objects/_index';

export interface VerifyUserEmailRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    user_id: string;
    url: string;
  };
}

export interface VerifyUserEmailResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    empty: boolean;
  };
}
