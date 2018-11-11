import * as apiObjects from '../../objects/_index';
import { PongResponse200BodyPayload } from './pong-response-200-body-payload';

export interface PongResponse200Body {
  info: apiObjects.ServerResponse;
  payload: PongResponse200BodyPayload;
}
