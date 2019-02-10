import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class GetStateFailAction implements Action {
  type = actionTypes.GET_STATE_FAIL;

  constructor(public payload: { error: any }) {}
}
