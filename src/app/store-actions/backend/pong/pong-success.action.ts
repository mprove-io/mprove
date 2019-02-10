import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class PongSuccessAction implements Action {
  readonly type = actionTypes.PONG_SUCCESS;

  constructor() {}
}
