import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class RunQueriesAction implements Action {
  readonly type = actionTypes.RUN_QUERIES;

  constructor(public payload: api.RunQueriesRequestBodyPayload) {}
}
