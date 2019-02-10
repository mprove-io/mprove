import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class ResetErrorsStateAction implements Action {
  readonly type = actionTypes.RESET_ERRORS_STATE;

  constructor() {}
}
