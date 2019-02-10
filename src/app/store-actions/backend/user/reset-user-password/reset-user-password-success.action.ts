import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class ResetUserPasswordSuccessAction implements Action {
  readonly type = actionTypes.RESET_USER_PASSWORD_SUCCESS;

  constructor(
    public payload: api.ResetUserPasswordResponse200Body['payload']
  ) {}
}
