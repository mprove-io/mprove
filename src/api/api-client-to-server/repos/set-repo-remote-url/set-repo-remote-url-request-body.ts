import * as apiObjects from '../../../objects/_index';
import { SetRepoRemoteUrlRequestBodyPayload } from './set-repo-remote-url-request-body-payload';

export interface SetRepoRemoteUrlRequestBody {
  info: apiObjects.ClientRequest;
  payload: SetRepoRemoteUrlRequestBodyPayload;
}
