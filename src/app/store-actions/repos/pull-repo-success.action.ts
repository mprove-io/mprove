import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';

export class PullRepoSuccessAction implements Action {
  readonly type = actionTypes.PULL_REPO_SUCCESS;

  constructor(public payload: api.PullRepoResponse200Body['payload']) {}
}
