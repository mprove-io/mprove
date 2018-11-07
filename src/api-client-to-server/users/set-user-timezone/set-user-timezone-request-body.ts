import * as apiObjects from '../../../objects/_index';
import { SetUserTimezoneRequestBodyPayload } from './set-user-timezone-request-body-payload';

export interface SetUserTimezoneRequestBody {
  info: apiObjects.ClientRequest;
  payload: SetUserTimezoneRequestBodyPayload;
}
