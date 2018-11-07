import * as apiObjects from '../../../objects/_index';
import {
  SetProjectQuerySizeLimitRequestBodyPayload
} from './set-project-query-size-limit-request-body-payload';

export interface SetProjectQuerySizeLimitRequestBody {
  info: apiObjects.ClientRequest;
  payload: SetProjectQuerySizeLimitRequestBodyPayload;
}
