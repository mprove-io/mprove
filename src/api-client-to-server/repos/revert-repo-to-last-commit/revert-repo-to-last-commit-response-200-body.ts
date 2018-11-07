import * as apiObjects from '../../../objects/_index';
import { RevertRepoToLastCommitResponse200BodyPayload } from './revert-repo-to-last-commit-response-200-body-payload';

export interface RevertRepoToLastCommitResponse200Body {
  info: apiObjects.ServerResponse;
  payload: RevertRepoToLastCommitResponse200BodyPayload;
}
