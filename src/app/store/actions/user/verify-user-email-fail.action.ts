import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class VerifyUserEmailFailAction implements Action {
  readonly type = actionTypes.VERIFY_USER_EMAIL_FAIL;

  constructor(public payload: { error: any }) {}
}
