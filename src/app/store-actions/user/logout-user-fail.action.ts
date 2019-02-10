import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class LogoutUserFailAction implements Action {
  readonly type = actionTypes.LOGOUT_USER_FAIL;

  constructor(public payload: { error: any }) {}
}
