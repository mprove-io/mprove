import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class PullRepoAction implements Action {
  readonly type = actionTypes.PULL_REPO;

  constructor(public payload: api.PullRepoRequestBody['payload']) {}
}
