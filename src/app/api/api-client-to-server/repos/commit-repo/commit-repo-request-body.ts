import * as apiObjects from '../../../objects/_index';
import { CommitRepoRequestBodyPayload } from './commit-repo-request-body-payload';

export interface CommitRepoRequestBody {
  info: apiObjects.ClientRequest;
  payload: CommitRepoRequestBodyPayload;
}
