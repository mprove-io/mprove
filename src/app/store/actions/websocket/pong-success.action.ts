import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class PongSuccessAction implements Action {
  readonly type = actionTypes.PONG_SUCCESS;

  constructor() {
  }
}
