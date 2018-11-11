import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class SetRepoRemoteUrlAction implements Action {
  readonly type = actionTypes.SET_REPO_REMOTE_URL;

  constructor(public payload: api.SetRepoRemoteUrlRequestBodyPayload) {
  }
}
