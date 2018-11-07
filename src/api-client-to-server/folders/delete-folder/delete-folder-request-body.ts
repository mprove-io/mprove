import * as apiObjects from '../../../objects/_index';
import { DeleteFolderRequestBodyPayload } from './delete-folder-request-body-payload';

export interface DeleteFolderRequestBody {
  info: apiObjects.ClientRequest;
  payload: DeleteFolderRequestBodyPayload;
}
