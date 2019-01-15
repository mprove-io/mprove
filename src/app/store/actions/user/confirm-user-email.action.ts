import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class ConfirmUserEmailAction implements Action {
  readonly type = actionTypes.CONFIRM_USER_EMAIL;

  constructor(public payload: api.ConfirmUserEmailRequestBodyPayload) {}
}
