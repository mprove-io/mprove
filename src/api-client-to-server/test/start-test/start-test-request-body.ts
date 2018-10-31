import * as api from '../../../_index';

export interface StartTestRequestBody {
  info: api.TestRequestToServer;
  payload: api.StartTestRequestBodyPayload;
}
