import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class SetProjectQuerySizeLimitAction implements Action {
  readonly type = actionTypes.SET_PROJECT_QUERY_SIZE_LIMIT;

  constructor(public payload: api.SetProjectQuerySizeLimitRequestBodyPayload) {
  }
}
