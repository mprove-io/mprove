import * as apiObjects from '../../../objects/_index';
import { DeleteFileRequestBodyPayload } from './delete-file-request-body-payload';

export interface DeleteFileRequestBody {
  info: apiObjects.ClientRequest;
  payload: DeleteFileRequestBodyPayload;
}
