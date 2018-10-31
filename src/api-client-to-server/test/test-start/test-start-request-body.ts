import * as api from '../../_index';

export interface TestStartRequestBody {
  info: api.TestRequestToServer;
  payload: api.TestStartRequestBodyPayload;
}
