import * as apiObjects from '../../../objects/_index';
import { PushRepoResponse200BodyPayload } from './push-repo-response-200-body-payload';


export interface PushRepoResponse200Body {
  info: apiObjects.ServerResponse;
  payload: PushRepoResponse200BodyPayload;
}
