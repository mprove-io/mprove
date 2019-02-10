import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class OpenWebSocketAction implements Action {
  readonly type = actionTypes.OPEN_WEBSOCKET;

  constructor() {}
}
