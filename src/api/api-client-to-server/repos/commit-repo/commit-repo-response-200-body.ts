import * as apiObjects from '../../../objects/_index';
import { CommitRepoResponse200BodyPayload } from './commit-repo-response-200-body-payload';

export interface CommitRepoResponse200Body {
  info: apiObjects.ServerResponse;
  payload: CommitRepoResponse200BodyPayload;
}
