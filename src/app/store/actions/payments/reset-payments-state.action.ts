import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class ResetPaymentsStateAction implements Action {
  readonly type = actionTypes.RESET_PAYMENTS_STATE;

  constructor() {
  }
}
