import * as apiObjects from '../../../objects/_index';
import { LogoutUserResponse200BodyPayload } from './logout-user-response-200-body-payload';

export interface LogoutUserResponse200Body {
  info: apiObjects.ServerResponse;
  payload: LogoutUserResponse200BodyPayload;
}
