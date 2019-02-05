import * as apiObjects from '../objects/_index';

export interface ConfirmRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    reply_to: string;
  };
}

export interface ConfirmResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    empty: boolean;
  };
}