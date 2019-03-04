import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class CommitRepoAction implements Action {
  readonly type = actionTypes.COMMIT_REPO;

  constructor(public payload: api.CommitRepoRequestBody['payload']) {}
}
