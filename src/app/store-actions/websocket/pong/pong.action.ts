import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class PongAction implements Action {
  readonly type = actionTypes.PONG;

  constructor(public payload: api.PongRequestBody['payload']) {}
}
