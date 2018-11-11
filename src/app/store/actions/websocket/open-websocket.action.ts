import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class OpenWebSocketAction implements Action {
  readonly type = actionTypes.OPEN_WEBSOCKET;

  constructor() {
  }
}
