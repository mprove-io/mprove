import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store/action-types';

export class SetRepoRemoteUrlFailAction implements Action {
  readonly type = actionTypes.SET_REPO_REMOTE_URL_FAIL;

  constructor(public payload: { error: any }) {}
}
