import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store/action-types';

export class CloseWebSocketSuccessAction implements Action {
  readonly type = actionTypes.CLOSE_WEBSOCKET_SUCCESS;

  constructor(public payload: any) {}
}
