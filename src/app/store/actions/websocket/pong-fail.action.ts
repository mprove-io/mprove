import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class PongFailAction implements Action {
  readonly type = actionTypes.PONG_FAIL;

  constructor(public payload: { error: any }) {
  }
}
