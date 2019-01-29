import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store/action-types';

export class LogoutUserFailAction implements Action {
  readonly type = actionTypes.LOGOUT_USER_FAIL;

  constructor(public payload: { error: any }) {}
}
