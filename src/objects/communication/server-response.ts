import * as api from '../../_index';

export interface ServerResponse {
  origin: api.CommunicationOriginEnum;
  type: api.CommunicationTypeEnum;
  reply_to: string;
  status: api.ServerResponseStatusEnum;
  error: api.ServerResponsePackageError;
}
