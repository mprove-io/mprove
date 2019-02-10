import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class OpenWebSocketSuccessAction implements Action {
  readonly type = actionTypes.OPEN_WEBSOCKET_SUCCESS;

  constructor() {}
}
