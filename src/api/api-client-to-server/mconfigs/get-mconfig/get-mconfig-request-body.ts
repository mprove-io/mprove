import * as apiObjects from '../../../objects/_index';
import { GetMconfigRequestBodyPayload } from './get-mconfig-request-body-payload';

export interface GetMconfigRequestBody {
  info: apiObjects.ClientRequest;
  payload: GetMconfigRequestBodyPayload;
}
