import * as api from '../../_index';

export interface TestRequestToServer {
  origin: api.CommunicationOriginEnum;
  type: api.CommunicationTypeEnum;
  request_id: string;
}
