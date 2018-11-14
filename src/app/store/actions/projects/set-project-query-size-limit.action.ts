import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class SetProjectQuerySizeLimitAction implements Action {
  readonly type = actionTypes.SET_PROJECT_QUERY_SIZE_LIMIT;

  constructor(public payload: api.SetProjectQuerySizeLimitRequestBodyPayload) {}
}
