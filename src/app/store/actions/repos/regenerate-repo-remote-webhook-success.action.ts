import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class RegenerateRepoRemoteWebhookSuccessAction implements Action {
  readonly type = actionTypes.REGENERATE_REPO_REMOTE_WEBHOOK_SUCCESS;

  constructor(public payload: api.RegenerateRepoRemoteWebhookResponse200BodyPayload) {
  }
}
