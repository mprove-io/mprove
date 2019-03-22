import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class LogoutUserSuccessAction implements Action {
  readonly type = actionTypes.LOGOUT_USER_SUCCESS;

  constructor(public payload: api.LogoutUserResponse200Body['payload']) {}
}
