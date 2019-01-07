import * as apiObjects from '../../../objects/_index';
import { LoginUserResponse200BodyPayload } from './login-user-response-200-body-payload';

export interface LoginUserResponse200Body {
  info: apiObjects.ServerResponse;
  payload: LoginUserResponse200BodyPayload;
}
