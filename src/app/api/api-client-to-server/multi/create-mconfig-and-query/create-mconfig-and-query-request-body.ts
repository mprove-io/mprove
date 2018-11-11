import * as apiObjects from '../../../objects/_index';
import { CreateMconfigAndQueryRequestBodyPayload } from './create-mconfig-and-query-request-body-payload';

export interface CreateMconfigAndQueryRequestBody {
  info: apiObjects.ClientRequest;
  payload: CreateMconfigAndQueryRequestBodyPayload;
}
