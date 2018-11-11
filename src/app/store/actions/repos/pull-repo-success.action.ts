import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class PullRepoSuccessAction implements Action {
  readonly type = actionTypes.PULL_REPO_SUCCESS;

  constructor(public payload: api.PullRepoResponse200BodyPayload) {
  }
}
