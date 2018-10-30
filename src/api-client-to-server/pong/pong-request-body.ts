import * as api from '../../_index';

export interface PongRequestBody {
  info: api.ClientRequest;
  payload: api.PongRequestBodyPayload;
}
