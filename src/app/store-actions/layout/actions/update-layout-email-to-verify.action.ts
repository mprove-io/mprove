import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class UpdateLayoutEmailToVerifyAction implements Action {
  readonly type = actionTypes.UPDATE_LAYOUT_EMAIL_TO_VERIFY;

  constructor(public payload: string) {}
}
