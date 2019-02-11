import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class CloseWebSocketAction implements Action {
  readonly type = actionTypes.CLOSE_WEBSOCKET;

  constructor() {}
}
