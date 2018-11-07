import * as apiObjects from '../../../objects/_index';
import { PullRepoResponse200BodyPayload } from './pull-repo-response-200-body-payload';

export interface PullRepoResponse200Body {
  info: apiObjects.ServerResponse;
  payload: PullRepoResponse200BodyPayload;
}
