import * as apiObjects from '../../../objects/_index';
import { CancelQueriesRequestBodyPayload } from './cancel-queries-request-body-payload';

export interface CancelQueriesRequestBody {
  info: apiObjects.ClientRequest;
  payload: CancelQueriesRequestBodyPayload;
}
