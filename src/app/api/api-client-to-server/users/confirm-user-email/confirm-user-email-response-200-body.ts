import * as apiObjects from '../../../objects/_index';
import { ConfirmUserEmailResponse200BodyPayload } from './confirm-user-email-response-200-body-payload';

export interface ConfirmUserEmailResponse200Body {
  info: apiObjects.ServerResponse;
  payload: ConfirmUserEmailResponse200BodyPayload;
}
