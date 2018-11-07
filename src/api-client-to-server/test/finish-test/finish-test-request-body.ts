import * as apiObjects from '../../../objects/_index';
import { FinishTestRequestBodyPayload } from './finish-test-request-body-payload';

export interface FinishTestRequestBody {
  info: apiObjects.TestRequestToServer;
  payload: FinishTestRequestBodyPayload;
}
