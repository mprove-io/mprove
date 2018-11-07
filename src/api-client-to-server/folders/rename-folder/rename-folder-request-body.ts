import * as apiObjects from '../../../objects/_index';
import { RenameFolderRequestBodyPayload } from './rename-folder-request-body-payload';

export interface RenameFolderRequestBody {
  info: apiObjects.ClientRequest;
  payload: RenameFolderRequestBodyPayload;
}
