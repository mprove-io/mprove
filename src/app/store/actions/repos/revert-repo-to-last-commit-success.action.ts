import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class RevertRepoToLastCommitSuccessAction implements Action {
  readonly type = actionTypes.REVERT_REPO_TO_LAST_COMMIT_SUCCESS;

  constructor(
    public payload: api.RevertRepoToLastCommitResponse200BodyPayload
  ) {}
}
