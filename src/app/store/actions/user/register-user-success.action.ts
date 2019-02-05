import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class RegisterUserSuccessAction implements Action {
  readonly type = actionTypes.REGISTER_USER_SUCCESS;

  constructor(public payload: api.RegisterUserResponse200Body['payload']) {}
}
