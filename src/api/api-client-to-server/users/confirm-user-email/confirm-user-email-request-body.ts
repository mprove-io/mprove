import * as apiObjects from '../../../objects/_index';
import { ConfirmUserEmailRequestBodyPayload } from './confirm-user-email-request-body-payload';

export interface ConfirmUserEmailRequestBody {
  info: apiObjects.ClientRequest;
  payload: ConfirmUserEmailRequestBodyPayload;
}
