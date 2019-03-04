import * as apiObjects from '../../../objects/_index';
import { SetProjectTimezoneRequestBodyPayload } from './set-project-timezone-request-body-payload';

export interface SetProjectTimezoneRequestBody {
  info: apiObjects.ClientRequest;
  payload: SetProjectTimezoneRequestBodyPayload;
}
