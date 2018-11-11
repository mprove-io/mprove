import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class RunQueriesDryAction implements Action {
  readonly type = actionTypes.RUN_QUERIES_DRY;

  constructor(public payload: api.RunQueriesDryRequestBodyPayload) {
  }
}
