import * as apiObjects from '../../../objects/_index';
import { StartTestRequestBodyPayload } from './start-test-request-body-payload';

export interface StartTestRequestBody {
  info: apiObjects.TestRequestToServer;
  payload: StartTestRequestBodyPayload;
}
