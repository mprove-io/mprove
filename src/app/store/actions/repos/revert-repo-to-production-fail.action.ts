import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class RevertRepoToProductionFailAction implements Action {
  readonly type = actionTypes.REVERT_REPO_TO_PRODUCTION_FAIL;

  constructor(public payload: { error: any }) {
  }
}
