import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class LogoutUserAction implements Action {
  readonly type = actionTypes.LOGOUT_USER;

  constructor(public payload: api.LogoutUserRequestBodyPayload) {
  }
}
