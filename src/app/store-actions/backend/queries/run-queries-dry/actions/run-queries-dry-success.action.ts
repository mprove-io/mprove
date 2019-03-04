import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class RunQueriesDrySuccessAction implements Action {
  readonly type = actionTypes.RUN_QUERIES_DRY_SUCCESS;

  constructor(public payload: api.RunQueriesDryResponse200Body['payload']) {}
}
