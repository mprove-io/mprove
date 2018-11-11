import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class SetUserTimezoneAction implements Action {
  readonly type = actionTypes.SET_USER_TIMEZONE;

  constructor(public payload: api.SetUserTimezoneRequestBodyPayload) {
  }
}
