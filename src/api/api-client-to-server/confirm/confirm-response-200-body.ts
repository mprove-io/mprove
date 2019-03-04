import * as apiObjects from '../../objects/_index';
import { ConfirmResponse200BodyPayload } from './confirm-response-200-body-payload';

export interface ConfirmResponse200Body {
  info: apiObjects.ServerResponse;
  payload: ConfirmResponse200BodyPayload;
}
