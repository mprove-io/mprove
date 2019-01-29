import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class RegenerateRepoRemoteWebhookAction implements Action {
  readonly type = actionTypes.REGENERATE_REPO_REMOTE_WEBHOOK;

  constructor(
    public payload: api.RegenerateRepoRemoteWebhookRequestBodyPayload
  ) {}
}
