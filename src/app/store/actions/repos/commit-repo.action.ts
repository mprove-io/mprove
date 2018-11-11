import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class CommitRepoAction implements Action {
  readonly type = actionTypes.COMMIT_REPO;

  constructor(public payload: api.CommitRepoRequestBodyPayload) {
  }
}
