import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';

export class LoginUserFailAction implements Action {
  readonly type = actionTypes.LOGIN_USER_FAIL;

  constructor(public payload: { error: any }) {}
}
