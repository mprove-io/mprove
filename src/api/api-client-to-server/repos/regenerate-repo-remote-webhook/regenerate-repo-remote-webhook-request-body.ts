import * as apiObjects from '../../../objects/_index';
import { RegenerateRepoRemoteWebhookRequestBodyPayload } from './regenerate-repo-remote-webhook-request-body-payload';

export interface RegenerateRepoRemoteWebhookRequestBody {
  info: apiObjects.ClientRequest;
  payload: RegenerateRepoRemoteWebhookRequestBodyPayload;
}
