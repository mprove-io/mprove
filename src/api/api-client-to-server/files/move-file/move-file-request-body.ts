import * as apiObjects from '../../../objects/_index';
import { MoveFileRequestBodyPayload } from './move-file-request-body-payload';

export interface MoveFileRequestBody {
  info: apiObjects.ClientRequest;
  payload: MoveFileRequestBodyPayload;
}
