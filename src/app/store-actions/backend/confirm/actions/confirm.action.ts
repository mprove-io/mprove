import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';
import * as api from '@app/api/_index';

export class ConfirmAction implements Action {
  readonly type = actionTypes.CONFIRM;

  constructor(public payload: api.ConfirmRequestBody['payload']) {}
}
