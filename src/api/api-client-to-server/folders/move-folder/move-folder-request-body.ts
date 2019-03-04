import * as apiObjects from '../../../objects/_index';
import { MoveFolderRequestBodyPayload } from './move-folder-request-body-payload';

export interface MoveFolderRequestBody {
  info: apiObjects.ClientRequest;
  payload: MoveFolderRequestBodyPayload;
}
