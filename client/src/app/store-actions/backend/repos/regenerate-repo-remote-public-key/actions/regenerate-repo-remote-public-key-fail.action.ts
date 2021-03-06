import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class RegenerateRepoRemotePublicKeyFailAction implements Action {
  readonly type = actionTypes.REGENERATE_REPO_REMOTE_PUBLIC_KEY_FAIL;

  constructor(public payload: { error: any }) {}
}
