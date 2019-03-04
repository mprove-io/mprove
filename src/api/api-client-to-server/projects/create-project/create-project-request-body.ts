import * as apiObjects from '../../../objects/_index';
import { CreateProjectRequestBodyPayload } from './create-project-request-body-payload';

export interface CreateProjectRequestBody {
  info: apiObjects.ClientRequest;
  payload: CreateProjectRequestBodyPayload;
}
