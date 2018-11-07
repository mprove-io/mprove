import * as apiObjects from '../../../objects/_index';
import { CleanDataRequestBodyPayload } from './clean-data-request-body-payload';

export interface CleanDataRequestBody {
  info: apiObjects.TestRequestToServer;
  payload: CleanDataRequestBodyPayload;
}
