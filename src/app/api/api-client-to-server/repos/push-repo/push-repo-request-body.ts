import * as apiObjects from '../../../objects/_index';
import { PushRepoRequestBodyPayload } from './push-repo-request-body-payload';

export interface PushRepoRequestBody {
  info: apiObjects.ClientRequest;
  payload: PushRepoRequestBodyPayload;
}
