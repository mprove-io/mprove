import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class UpdateLayoutEmailToResetPasswordAction implements Action {
  readonly type = actionTypes.UPDATE_LAYOUT_EMAIL_TO_RESET_PASSWORD;

  constructor(public payload: string) {}
}
