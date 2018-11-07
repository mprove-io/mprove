import * as apiObjects from '../../objects/_index';
import { UpdateStateRequestBodyPayload } from './update-state-request-body-payload';

export interface UpdateStateRequestBody {
  info: apiObjects.ServerRequestToClient;
  payload: UpdateStateRequestBodyPayload;
}
