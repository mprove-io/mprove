import * as apiObjects from '../../../objects/_index';
import { DeleteFolderResponse200BodyPayload } from './delete-folder-response-200-body-payload';

export interface DeleteFolderResponse200Body {
  info: apiObjects.ServerResponse;
  payload: DeleteFolderResponse200BodyPayload;
}
