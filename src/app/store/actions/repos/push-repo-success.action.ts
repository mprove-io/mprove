import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class PushRepoSuccessAction implements Action {
  readonly type = actionTypes.PUSH_REPO_SUCCESS;

  constructor(public payload: api.PushRepoResponse200BodyPayload) {
  }
}
