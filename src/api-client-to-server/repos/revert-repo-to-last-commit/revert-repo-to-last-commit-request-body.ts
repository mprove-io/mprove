import * as apiObjects from '../../../objects/_index';
import { RevertRepoToLastCommitRequestBodyPayload } from './revert-repo-to-last-commit-request-body-payload';

export interface RevertRepoToLastCommitRequestBody {
  info: apiObjects.ClientRequest;
  payload: RevertRepoToLastCommitRequestBodyPayload;
}
