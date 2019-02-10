import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class CancelQueriesFailAction implements Action {
  readonly type = actionTypes.CANCEL_QUERIES_FAIL;

  constructor(public payload: { error: any }) {}
}
