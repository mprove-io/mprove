import * as apiObjects from '../../../objects/_index';
import { MoveFolderResponse200BodyPayload } from './move-folder-response-200-body-payload';

export interface MoveFolderResponse200Body {
  info: apiObjects.ServerResponse;
  payload: MoveFolderResponse200BodyPayload;
}
