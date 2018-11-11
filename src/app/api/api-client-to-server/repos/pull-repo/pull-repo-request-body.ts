import * as apiObjects from '../../../objects/_index';
import { PullRepoRequestBodyPayload } from './pull-repo-request-body-payload';

export interface PullRepoRequestBody {
  info: apiObjects.ClientRequest;
  payload: PullRepoRequestBodyPayload;
}
