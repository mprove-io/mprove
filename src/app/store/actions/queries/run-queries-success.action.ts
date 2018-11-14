import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class RunQueriesSuccessAction implements Action {
  readonly type = actionTypes.RUN_QUERIES_SUCCESS;

  constructor(public payload: api.RunQueriesResponse200BodyPayload) {}
}
