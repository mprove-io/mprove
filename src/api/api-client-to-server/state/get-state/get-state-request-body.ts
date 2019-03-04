import * as apiObjects from '../../../objects/_index';
import { GetStateRequestBodyPayload } from './get-state-request-body-payload';

export interface GetStateRequestBody {
  info: apiObjects.ClientRequest;
  payload: GetStateRequestBodyPayload;
}
