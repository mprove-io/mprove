import * as apiObjects from '../../../objects/_index';
import { LogoutUserRequestBodyPayload } from './logout-user-request-body-payload';

export interface LogoutUserRequestBody {
  info: apiObjects.ClientRequest;
  payload: LogoutUserRequestBodyPayload;
}
