import * as api from '../../_index';

export interface PingRequestBody {
  info: api.ServerRequestToClient;
  payload: api.PingRequestBodyPayload;
}
