import * as apiObjects from '../objects/_index';

export interface PongRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    init_id: string;
  };
}

export interface PongResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    empty: boolean;
  };
}
