import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class CommitRepoSuccessAction implements Action {
  readonly type = actionTypes.COMMIT_REPO_SUCCESS;

  constructor(public payload: api.CommitRepoResponse200BodyPayload) {
  }
}
