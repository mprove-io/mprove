import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class UpdateUserPasswordSuccessAction implements Action {
  readonly type = actionTypes.UPDATE_USER_PASSWORD_SUCCESS;

  constructor(public payload: api.UpdateUserPasswordResponse200BodyPayload) {}
}
