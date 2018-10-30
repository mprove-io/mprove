import * as api from '../../_index';

export interface ServerRequestToBlockml {
  origin: api.CommunicationOriginEnum;
  type: api.CommunicationTypeEnum;
  request_id: string;
}
