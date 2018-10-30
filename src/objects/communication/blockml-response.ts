import * as api from '../../_index';

export interface BlockmlResponse {
  origin: api.CommunicationOriginEnum;
  type: api.CommunicationTypeEnum;
  reply_to: string;
  status: api.BlockmlResponseStatusEnum;
  error: api.BlockmlResponsePackageError;
}
