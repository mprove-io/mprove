import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class UpdateReposStateAction implements Action {
  readonly type = actionTypes.UPDATE_REPOS_STATE;

  constructor(public payload: api.Repo[]) {}
}
