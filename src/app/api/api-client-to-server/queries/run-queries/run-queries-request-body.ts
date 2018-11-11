import * as apiObjects from '../../../objects/_index';
import { RunQueriesRequestBodyPayload } from './run-queries-request-body-payload';

export interface RunQueriesRequestBody {
  info: apiObjects.ClientRequest;
  payload: RunQueriesRequestBodyPayload;
}
