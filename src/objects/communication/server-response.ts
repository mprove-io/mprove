import * as apiEnums from '../../enums/_index';
import { ServerResponsePackageError } from './server-response-package-error';

export interface ServerResponse {
  origin: apiEnums.CommunicationOriginEnum;
  type: apiEnums.CommunicationTypeEnum;
  reply_to: string;
  status: apiEnums.ServerResponseStatusEnum;
  error: ServerResponsePackageError;
}
