import * as apiObjects from '../../../objects/_index';
import { CreateFileRequestBodyPayload } from './create-file-request-body-payload';

export interface CreateFileRequestBody {
  info: apiObjects.ClientRequest;
  payload: CreateFileRequestBodyPayload;
}
