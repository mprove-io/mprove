import * as apiObjects from '../../objects/_index';

export interface ConfirmUserEmailRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    token: string;

  };
}

export interface ConfirmUserEmailResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    empty: boolean;

  };
}
