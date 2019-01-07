import * as apiObjects from '../../../objects/_index';
import { RegisterUserResponse200BodyPayload } from './register-user-response-200-body-payload';

export interface RegisterUserResponse200Body {
  info: apiObjects.ServerResponse;
  payload: RegisterUserResponse200BodyPayload;
}
