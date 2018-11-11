import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class GetStateSuccessAction implements Action {

  type = actionTypes.GET_STATE_SUCCESS;

  constructor(public payload: api.GetStateResponse200BodyPayload) {
  }
}
