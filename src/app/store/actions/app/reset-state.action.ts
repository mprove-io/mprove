import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store/action-types';

export class ResetStateAction implements Action {
  type = actionTypes.RESET_STATE;

  constructor() {}
}
