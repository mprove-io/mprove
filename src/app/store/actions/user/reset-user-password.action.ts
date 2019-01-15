import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class ResetUserPasswordAction implements Action {
  readonly type = actionTypes.RESET_USER_PASSWORD;

  constructor(public payload: api.ResetUserPasswordRequestBodyPayload) {}
}
