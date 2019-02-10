import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class RegenerateRepoRemoteWebhookFailAction implements Action {
  readonly type = actionTypes.REGENERATE_REPO_REMOTE_WEBHOOK_FAIL;

  constructor(public payload: { error: any }) {}
}
