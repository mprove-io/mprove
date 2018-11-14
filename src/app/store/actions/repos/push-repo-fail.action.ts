import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class PushRepoFailAction implements Action {
  readonly type = actionTypes.PUSH_REPO_FAIL;

  constructor(public payload: { error: any }) {}
}
