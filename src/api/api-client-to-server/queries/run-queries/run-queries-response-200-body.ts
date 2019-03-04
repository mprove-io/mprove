import * as apiObjects from '../../../objects/_index';
import { RunQueriesResponse200BodyPayload } from './run-queries-response-200-body-payload';

export interface RunQueriesResponse200Body {
  info: apiObjects.ServerResponse;
  payload: RunQueriesResponse200BodyPayload;
}
