import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store/action-types';

export class CommitRepoFailAction implements Action {
  readonly type = actionTypes.COMMIT_REPO_FAIL;

  constructor(public payload: { error: any }) {}
}
