import * as apiObjects from '../../../objects/_index';
import { RenameFolderResponse200BodyPayload } from './rename-folder-response-200-body-payload';


export interface RenameFolderResponse200Body {
  info: apiObjects.ServerResponse;
  payload: RenameFolderResponse200BodyPayload;
}
