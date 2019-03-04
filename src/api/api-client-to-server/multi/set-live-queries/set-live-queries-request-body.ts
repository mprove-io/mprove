import * as apiObjects from '../../../objects/_index';
import { SetLiveQueriesRequestBodyPayload } from './set-live-queries-request-body-payload';

export interface SetLiveQueriesRequestBody {
  info: apiObjects.ClientRequest;
  payload: SetLiveQueriesRequestBodyPayload;
}
