import * as api from '../_index';

export interface ServerRequestToClient {
  origin: api.ServerRequestToClientOriginEnum;
  type: api.ServerRequestToClientTypeEnum;
  init_id: string;
  request_id: string;
  action: api.ServerRequestToClientActionEnum;
}