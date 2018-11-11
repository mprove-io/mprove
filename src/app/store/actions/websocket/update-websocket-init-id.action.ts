import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class UpdateWebSocketInitIdAction implements Action {
  readonly type = actionTypes.UPDATE_WEBSOCKET_INIT_ID;

  constructor(public payload: string) {
  }
}
