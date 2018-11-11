import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class SetLiveQueriesFailAction implements Action {
  readonly type = actionTypes.SET_LIVE_QUERIES_FAIL;

  constructor(public payload: { error: any }) {
  }
}
