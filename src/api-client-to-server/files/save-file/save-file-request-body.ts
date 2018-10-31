import * as api from '../../../_index';

export interface SaveFileRequestBody {
  info: api.ClientRequest;
  payload: api.SaveFileRequestBodyPayload;
}
