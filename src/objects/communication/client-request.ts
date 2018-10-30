import * as api from '../../_index';

export interface ClientRequest {
  type: api.CommunicationTypeEnum;
  origin: api.CommunicationOriginEnum;
  request_id: string;
  init_id: string;
}
