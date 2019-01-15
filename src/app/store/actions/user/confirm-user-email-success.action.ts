import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class ConfirmUserEmailSuccessAction implements Action {
  readonly type = actionTypes.CONFIRM_USER_EMAIL_SUCCESS;

  constructor(public payload: api.ConfirmUserEmailResponse200BodyPayload) {}
}
