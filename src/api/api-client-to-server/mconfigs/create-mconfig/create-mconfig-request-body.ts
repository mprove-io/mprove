import * as apiObjects from '../../../objects/_index';
import { CreateMconfigRequestBodyPayload } from './create-mconfig-request-body-payload';

export interface CreateMconfigRequestBody {
  info: apiObjects.ClientRequest;
  payload: CreateMconfigRequestBodyPayload;
}
