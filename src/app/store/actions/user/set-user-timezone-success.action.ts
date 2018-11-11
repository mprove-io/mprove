import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class SetUserTimezoneSuccessAction implements Action {
  readonly type = actionTypes.SET_USER_TIMEZONE_SUCCESS;

  constructor(public payload: api.SetUserTimezoneResponse200BodyPayload) { // for effects
  }
}
