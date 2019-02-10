import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';
import * as api from '@app/api/_index';

export class SetProjectWeekStartAction implements Action {
  readonly type = actionTypes.SET_PROJECT_WEEK_START;

  constructor(public payload: api.SetProjectWeekStartRequestBody['payload']) {}
}

export class SetProjectWeekStartSuccessAction implements Action {
  readonly type = actionTypes.SET_PROJECT_WEEK_START_SUCCESS;

  constructor(
    public payload: api.SetProjectWeekStartResponse200Body['payload']
  ) {}
}

export class SetProjectWeekStartFailAction implements Action {
  readonly type = actionTypes.SET_PROJECT_WEEK_START_FAIL;

  constructor(public payload: { error: any }) {}
}
