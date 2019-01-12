import * as apiObjects from '../../../objects/_index';
import { VerifyUserEmailRequestBodyPayload } from './verify-user-email-request-body-payload';

export interface VerifyUserEmailRequestBody {
  info: apiObjects.ClientRequest;
  payload: VerifyUserEmailRequestBodyPayload;
}
