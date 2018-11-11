import * as apiObjects from '../../../objects/_index';
import { StartTestResponse200BodyPayload } from './start-test-response-200-body-payload';

export interface StartTestResponse200Body {
  info: apiObjects.ServerResponse;
  payload: StartTestResponse200BodyPayload;
}
