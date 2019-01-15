import * as apiObjects from '../../../objects/_index';
import { ResetUserPasswordRequestBodyPayload } from './reset-user-password-request-body-payload';

export interface ResetUserPasswordRequestBody {
  info: apiObjects.ClientRequest;
  payload: ResetUserPasswordRequestBodyPayload;
}
