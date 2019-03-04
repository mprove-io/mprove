import * as apiObjects from '../../../objects/_index';
import { SetUserTimezoneResponse200BodyPayload } from './set-user-timezone-response-200-body-payload';

export interface SetUserTimezoneResponse200Body {
  info: apiObjects.ServerResponse;
  payload: SetUserTimezoneResponse200BodyPayload;
}
