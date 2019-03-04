import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class UpdatePaymentsStateAction implements Action {
  readonly type = actionTypes.UPDATE_PAYMENTS_STATE;

  constructor(public payload: api.Payment[]) {}
}
