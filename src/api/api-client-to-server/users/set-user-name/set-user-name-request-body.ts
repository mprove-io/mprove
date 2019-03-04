import * as apiObjects from '../../../objects/_index';
import { SetUserNameRequestBodyPayload } from './set-user-name-request-body-payload';

export interface SetUserNameRequestBody {
  info: apiObjects.ClientRequest;
  payload: SetUserNameRequestBodyPayload;
}
