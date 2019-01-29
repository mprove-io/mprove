import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class RegisterUserFailAction implements Action {
  readonly type = actionTypes.REGISTER_USER_FAIL;

  constructor(public payload: { error: any }) {}
}
