import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';
import * as api from '@app/api/_index';

export class SetProjectTimezoneAction implements Action {
  readonly type = actionTypes.SET_PROJECT_TIMEZONE;

  constructor(public payload: api.SetProjectTimezoneRequestBody['payload']) {}
}

export class SetProjectTimezoneSuccessAction implements Action {
  readonly type = actionTypes.SET_PROJECT_TIMEZONE_SUCCESS;

  constructor(
    public payload: api.SetProjectTimezoneResponse200Body['payload']
  ) {}
}

export class SetProjectTimezoneFailAction implements Action {
  readonly type = actionTypes.SET_PROJECT_TIMEZONE_FAIL;

  constructor(public payload: { error: any }) {}
}
