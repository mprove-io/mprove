import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class RestartWebSocketAction implements Action {
  readonly type = actionTypes.RESTART_WEBSOCKET;

  constructor() {
  }
}
