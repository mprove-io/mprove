import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class SetUserTimezoneFailAction implements Action {
  readonly type = actionTypes.SET_USER_TIMEZONE_FAIL;

  constructor(public payload: { error: any }) {}
}
