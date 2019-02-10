import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class ConfirmAction implements Action {
  readonly type = actionTypes.CONFIRM;

  constructor(public payload: api.ConfirmRequestBody['payload']) {}
}
