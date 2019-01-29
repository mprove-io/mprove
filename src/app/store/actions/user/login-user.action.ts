import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class LoginUserAction implements Action {
  readonly type = actionTypes.LOGIN_USER;

  constructor(public payload: api.LoginUserRequestBodyPayload) {}
}
