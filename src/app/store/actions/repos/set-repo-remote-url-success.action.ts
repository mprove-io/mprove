import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class SetRepoRemoteUrlSuccessAction implements Action {
  readonly type = actionTypes.SET_REPO_REMOTE_URL_SUCCESS;

  constructor(public payload: api.SetRepoRemoteUrlResponse200BodyPayload) {
  }
}
