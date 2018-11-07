import * as apiObjects from '../../../objects/_index';
import { RunQueriesDryRequestBodyPayload } from './run-queries-dry-request-body-payload';

export interface RunQueriesDryRequestBody {
  info: apiObjects.ClientRequest;
  payload: RunQueriesDryRequestBodyPayload;
}
