import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class RunQueriesAction implements Action {
  readonly type = actionTypes.RUN_QUERIES;

  constructor(public payload: api.RunQueriesRequestBodyPayload) {
  }
}
