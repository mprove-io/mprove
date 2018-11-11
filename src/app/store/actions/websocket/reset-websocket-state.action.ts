import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class ResetWebSocketStateAction implements Action {
  readonly type = actionTypes.RESET_WEBSOCKET_STATE;

  constructor() {
  }
}
