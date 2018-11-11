import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class StateReceivedAction implements Action {
  readonly type = actionTypes.STATE_RECEIVED;

  constructor(public payload: api.UpdateStateRequestBody) {
  }
}
