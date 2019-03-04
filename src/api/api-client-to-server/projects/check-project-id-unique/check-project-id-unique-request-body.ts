import * as apiObjects from '../../../objects/_index';
import { CheckProjectIdUniqueRequestBodyPayload } from './check-project-id-unique-request-body-payload';

export interface CheckProjectIdUniqueRequestBody {
  info: apiObjects.ClientRequest;
  payload: CheckProjectIdUniqueRequestBodyPayload;
}
