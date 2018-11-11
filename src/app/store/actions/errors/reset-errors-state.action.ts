import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class ResetErrorsStateAction implements Action {

  readonly type = actionTypes.RESET_ERRORS_STATE;

  constructor() {
  }
}
