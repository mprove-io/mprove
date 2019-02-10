import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';

export class LoginUserSuccessAction implements Action {
  readonly type = actionTypes.LOGIN_USER_SUCCESS;

  constructor(public payload: api.LoginUserResponse200Body['payload']) {}
}
