import * as apiObjects from '../../../objects/_index';
import { RegenerateRepoRemotePublicKeyRequestBodyPayload } from './regenerate-repo-remote-public-key-request-body-payload';

export interface RegenerateRepoRemotePublicKeyRequestBody {
  info: apiObjects.ClientRequest;
  payload: RegenerateRepoRemotePublicKeyRequestBodyPayload;
}
