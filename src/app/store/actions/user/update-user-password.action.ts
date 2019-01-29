import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class UpdateUserPasswordAction implements Action {
  readonly type = actionTypes.UPDATE_USER_PASSWORD;

  constructor(public payload: api.UpdateUserPasswordRequestBodyPayload) {}
}
