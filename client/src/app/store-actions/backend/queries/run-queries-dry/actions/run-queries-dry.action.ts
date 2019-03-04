import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class RunQueriesDryAction implements Action {
  readonly type = actionTypes.RUN_QUERIES_DRY;

  constructor(public payload: api.RunQueriesDryRequestBody['payload']) {}
}
