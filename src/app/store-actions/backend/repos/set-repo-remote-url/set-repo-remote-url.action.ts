import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class SetRepoRemoteUrlAction implements Action {
  readonly type = actionTypes.SET_REPO_REMOTE_URL;

  constructor(public payload: api.SetRepoRemoteUrlRequestBody['payload']) {}
}
