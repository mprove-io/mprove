import * as apiObjects from '../../../objects/_index';
import { GetStateResponse200BodyPayload } from './get-state-response-200-body-payload';

export interface GetStateResponse200Body {
  info: apiObjects.ServerResponse;
  payload: GetStateResponse200BodyPayload;
}
