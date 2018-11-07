import * as apiObjects from '../../objects/_index';
import { ConfirmRequestBodyPayload } from './confirm-request-body-payload';

export interface ConfirmRequestBody {
  info: apiObjects.ClientRequest;
  payload: ConfirmRequestBodyPayload;
}
