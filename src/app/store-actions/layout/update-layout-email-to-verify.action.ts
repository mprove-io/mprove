import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class UpdateLayoutEmailToVerifyAction implements Action {
  readonly type = actionTypes.UPDATE_LAYOUT_EMAIL_TO_VERIFY;

  constructor(public payload: string) {}
}
