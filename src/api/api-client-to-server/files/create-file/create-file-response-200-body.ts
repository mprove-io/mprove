import * as apiObjects from '../../../objects/_index';
import { CreateFileResponse200BodyPayload } from './create-file-response-200-body-payload';

export interface CreateFileResponse200Body {
  info: apiObjects.ServerResponse;
  payload: CreateFileResponse200BodyPayload;
}
