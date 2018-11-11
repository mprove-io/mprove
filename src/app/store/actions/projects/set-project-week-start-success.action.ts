import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class SetProjectWeekStartSuccessAction implements Action {
  readonly type = actionTypes.SET_PROJECT_WEEK_START_SUCCESS;

  constructor(public payload: api.SetProjectWeekStartResponse200BodyPayload) {
  }
}
