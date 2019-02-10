import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class PongSuccessAction implements Action {
  readonly type = actionTypes.PONG_SUCCESS;

  constructor() {}
}
