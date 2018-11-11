import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class CancelQueriesFailAction implements Action {
  readonly type = actionTypes.CANCEL_QUERIES_FAIL;

  constructor(public payload: { error: any }) {
  }
}
