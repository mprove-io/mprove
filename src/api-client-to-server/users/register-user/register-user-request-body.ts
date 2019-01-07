import * as apiObjects from '../../../objects/_index';
import { RegisterUserRequestBodyPayload } from './register-user-request-body-payload';

export interface RegisterUserRequestBody {
  info: apiObjects.ClientRequest;
  payload: RegisterUserRequestBodyPayload;
}
