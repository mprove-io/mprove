import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';

export class LogoutUserAction implements Action {
  readonly type = actionTypes.LOGOUT_USER;

  constructor(public payload: api.LogoutUserRequestBody['payload']) {}
}
