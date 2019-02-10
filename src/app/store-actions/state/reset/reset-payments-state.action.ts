import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class ResetPaymentsStateAction implements Action {
  readonly type = actionTypes.RESET_PAYMENTS_STATE;

  constructor() {}
}
