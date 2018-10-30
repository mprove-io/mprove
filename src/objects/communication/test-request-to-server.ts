import * as api from '../../_index';

export interface TestRequestToServer {
  origin: api.TestRequestToServerOriginEnum;
  type: api.TestRequestToServerTypeEnum;
  request_id: string;
}
