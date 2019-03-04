import * as apiEnums from '../../enums/_index';
import { BlockmlResponsePackageError } from './blockml-response-package-error';

export interface BlockmlResponse {
  origin: apiEnums.CommunicationOriginEnum;
  type: apiEnums.CommunicationTypeEnum;
  reply_to: string;
  status: apiEnums.BlockmlResponseStatusEnum;
  error: BlockmlResponsePackageError;
}
