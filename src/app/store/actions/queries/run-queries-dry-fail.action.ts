import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class RunQueriesDryFailAction implements Action {
  readonly type = actionTypes.RUN_QUERIES_DRY_FAIL;

  constructor(public payload: { error: any }) {
  }
}
