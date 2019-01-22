import * as apiObjects from '../../../objects/_index';
import { ResetUserPasswordResponse200BodyPayload } from './reset-user-password-response-200-body-payload';

export interface ResetUserPasswordResponse200Body {
  info: apiObjects.ServerResponse;
  payload: ResetUserPasswordResponse200BodyPayload;
}
