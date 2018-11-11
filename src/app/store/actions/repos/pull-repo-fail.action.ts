import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class PullRepoFailAction implements Action {
  readonly type = actionTypes.PULL_REPO_FAIL;

  constructor(public payload: { error: any }) {
  }
}
