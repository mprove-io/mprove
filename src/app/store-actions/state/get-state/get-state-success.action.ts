import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class GetStateSuccessAction implements Action {
  type = actionTypes.GET_STATE_SUCCESS;

  constructor(public payload: api.GetStateResponse200Body['payload']) {}
}
