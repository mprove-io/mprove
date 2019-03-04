import * as apiObjects from '../../../objects/_index';
import { CleanDataResponse200BodyPayload } from './clean-data-response-200-body-payload';

export interface CleanDataResponse200Body {
  info: apiObjects.ServerResponse;
  payload: CleanDataResponse200BodyPayload;
}
