import * as api from '../_index';

export interface BlockmlResponse {
  origin: api.BlockmlResponseOriginEnum;

  type: api.BlockmlResponseTypeEnum;

  reply_to: string;

  status: api.BlockmlResponseStatusEnum;

  error: api.BlockmlResponsePackageError;

}