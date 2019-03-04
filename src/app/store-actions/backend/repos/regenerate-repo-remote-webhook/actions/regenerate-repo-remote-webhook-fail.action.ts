import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class RegenerateRepoRemoteWebhookFailAction implements Action {
  readonly type = actionTypes.REGENERATE_REPO_REMOTE_WEBHOOK_FAIL;

  constructor(public payload: { error: any }) {}
}
