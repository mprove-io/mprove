import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class ResetUserStateAction implements Action {
  readonly type = actionTypes.RESET_USER_STATE;

  constructor() {
  }
}
