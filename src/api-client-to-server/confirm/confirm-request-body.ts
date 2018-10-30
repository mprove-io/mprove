import * as api from '../../_index';

export interface ConfirmRequestBody {
  info: api.ClientRequest;
  payload: api.ConfirmRequestBodyPayload;
}
