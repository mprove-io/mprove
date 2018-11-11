import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class ResetReposStateAction implements Action {
  readonly type = actionTypes.RESET_REPOS_STATE;

  constructor() {
  }
}
