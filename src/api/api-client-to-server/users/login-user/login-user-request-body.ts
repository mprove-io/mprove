import * as apiObjects from '../../../objects/_index';
import { LoginUserRequestBodyPayload } from './login-user-request-body-payload';

export interface LoginUserRequestBody {
  info: apiObjects.ClientRequest;
  payload: LoginUserRequestBodyPayload;
}
