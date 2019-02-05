import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class SetProjectWeekStartAction implements Action {
  readonly type = actionTypes.SET_PROJECT_WEEK_START;

  constructor(public payload: api.SetProjectWeekStartRequestBody['payload']) {}
}
