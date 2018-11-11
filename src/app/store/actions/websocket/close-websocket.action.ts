import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class CloseWebSocketAction implements Action {
  readonly type = actionTypes.CLOSE_WEBSOCKET;

  constructor() {
  }
}
