import * as apiObjects from '../../../objects/_index';
import { CreateFolderResponse200BodyPayload } from './create-folder-response-200-body-payload';

export interface CreateFolderResponse200Body {
  info: apiObjects.ServerResponse;
  payload: CreateFolderResponse200BodyPayload;
}
