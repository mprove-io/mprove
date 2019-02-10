import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class LoginUserFailAction implements Action {
  readonly type = actionTypes.LOGIN_USER_FAIL;

  constructor(public payload: { error: any }) {}
}
