import * as apiObjects from '../../../objects/_index';
import { CancelQueriesResponse200BodyPayload } from './cancel-queries-response-200-body-payload';

export interface CancelQueriesResponse200Body {
  info: apiObjects.ServerResponse;
  payload: CancelQueriesResponse200BodyPayload;
}
