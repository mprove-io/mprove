import * as api from '../../../_index';

export interface FinishTestRequestBody {
  info: api.TestRequestToServer;
  payload: api.FinishTestRequestBodyPayload;
}
