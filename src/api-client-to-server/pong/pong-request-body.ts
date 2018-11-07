import * as apiObjects from '../../objects/_index';
import { PongRequestBodyPayload } from './pong-request-body-payload';

export interface PongRequestBody {
  info: apiObjects.ClientRequest;
  payload: PongRequestBodyPayload;
}
