import * as api from '../../_index';

export interface TestCleanRequestBody {
  info: api.TestRequestToServer;
  payload: api.TestCleanRequestBodyPayload;
}
