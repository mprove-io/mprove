import * as apiObjects from '../../objects/_index';
import { PingRequestBodyPayload } from './ping-request-body-payload';

export interface PingRequestBody {
  info: apiObjects.ServerRequestToClient;
  payload: PingRequestBodyPayload;
}
