import * as apiObjects from '../../../objects/_index';
import { SetUserNameResponse200BodyPayload } from './set-user-name-response-200-body-payload';

export interface SetUserNameResponse200Body {
  info: apiObjects.ServerResponse;
  payload: SetUserNameResponse200BodyPayload;
}
