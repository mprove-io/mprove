import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class UpdateStateAction implements Action {
  type = actionTypes.UPDATE_STATE;

  constructor(public payload: api.UpdateStateRequestBody['payload']) {}
}
