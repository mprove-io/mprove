import * as api from '../../_index';

export interface UpdateStateRequestBody {
  info: api.ServerRequestToClient;
  payload: api.UpdateStateRequestBodyPayload;
}
