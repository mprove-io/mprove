import * as apiObjects from '../objects/_index';

export interface PingRequestBody {
  info: apiObjects.ServerRequestToClient;
  payload: {
    empty: boolean;
  };
}
