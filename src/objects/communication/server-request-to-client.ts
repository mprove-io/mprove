import * as api from '../../_index';

export interface ServerRequestToClient {
  origin: api.CommunicationOriginEnum;
  type: api.CommunicationTypeEnum;
  init_id: string;
  request_id: string;
  action: api.ServerRequestToClientActionEnum;
}
