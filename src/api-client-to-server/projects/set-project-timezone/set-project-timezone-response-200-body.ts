import * as apiObjects from '../../../objects/_index';
import { SetProjectTimezoneResponse200BodyPayload } from './set-project-timezone-response-200-body-payload';

export interface SetProjectTimezoneResponse200Body {
  info: apiObjects.ServerResponse;
  payload: SetProjectTimezoneResponse200BodyPayload;
}
