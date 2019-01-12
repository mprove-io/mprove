import * as apiObjects from '../../../objects/_index';
import { VerifyUserEmailResponse200BodyPayload } from './verify-user-email-response-200-body-payload';

export interface VerifyUserEmailResponse200Body {
  info: apiObjects.ServerResponse;
  payload: VerifyUserEmailResponse200BodyPayload;
}
