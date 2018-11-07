import * as apiObjects from '../../../objects/_index';
import { GetPdtQueriesRequestBodyPayload } from './get-pdt-queries-request-body-payload';

export interface GetPdtQueriesRequestBody {
  info: apiObjects.ClientRequest;
  payload: GetPdtQueriesRequestBodyPayload;
}
