import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class PongAction implements Action {
  readonly type = actionTypes.PONG;

  constructor(public payload: api.PongRequestBodyPayload) {
  }
}
