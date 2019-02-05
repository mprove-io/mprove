import * as apiObjects from '../../objects/_index';

export interface GetStateRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    empty: boolean;

  };
}

export interface GetStateResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    init_id: string;
    state: apiObjects.State;
  };
}
