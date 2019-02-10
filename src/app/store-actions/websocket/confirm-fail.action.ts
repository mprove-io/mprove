import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class ConfirmFailAction implements Action {
  readonly type = actionTypes.CONFIRM_FAIL;

  constructor(public payload: { error: any }) {}
}
