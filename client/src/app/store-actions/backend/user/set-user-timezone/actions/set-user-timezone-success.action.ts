import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class SetUserTimezoneSuccessAction implements Action {
  readonly type = actionTypes.SET_USER_TIMEZONE_SUCCESS;

  constructor(public payload: api.SetUserTimezoneResponse200Body['payload']) {}
}
