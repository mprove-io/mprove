import * as apiObjects from '../../../objects/_index';
import { FinishTestResponse200BodyPayload } from './finish-test-response-200-body-payload';

export interface FinishTestResponse200Body {
  info: apiObjects.ServerResponse;
  payload: FinishTestResponse200BodyPayload;
}
