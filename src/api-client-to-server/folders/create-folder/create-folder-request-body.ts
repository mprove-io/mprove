import * as apiObjects from '../../../objects/_index';
import { CreateFolderRequestBodyPayload } from './create-folder-request-body-payload';

export interface CreateFolderRequestBody {
  info: apiObjects.ClientRequest;
  payload: CreateFolderRequestBodyPayload;
}
