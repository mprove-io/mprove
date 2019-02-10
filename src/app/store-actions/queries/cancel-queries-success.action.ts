import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';

export class CancelQueriesSuccessAction implements Action {
  readonly type = actionTypes.CANCEL_QUERIES_SUCCESS;

  constructor(public payload: api.CancelQueriesResponse200Body['payload']) {}
}
