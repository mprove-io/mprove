import * as apiObjects from '../../../objects/_index';
// tslint:disable-next-line:max-line-length
import { RegenerateRepoRemotePublicKeyRequestBodyPayload } from './regenerate-repo-remote-public-key-request-body-payload';

export interface RegenerateRepoRemotePublicKeyRequestBody {
  info: apiObjects.ClientRequest;
  payload: RegenerateRepoRemotePublicKeyRequestBodyPayload;
}
