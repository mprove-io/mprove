import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class ResetUserStateAction implements Action {
  readonly type = actionTypes.RESET_USER_STATE;

  constructor() {}
}
