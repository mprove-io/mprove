import * as api from '../../../_index';

export interface TestFinishRequestBody {
  info: api.TestRequestToServer;
  payload: api.TestFinishRequestBodyPayload;
}
