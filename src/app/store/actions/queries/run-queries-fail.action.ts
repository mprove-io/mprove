import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class RunQueriesFailAction implements Action {
  readonly type = actionTypes.RUN_QUERIES_FAIL;

  constructor(public payload: { error: any }) {}
}
