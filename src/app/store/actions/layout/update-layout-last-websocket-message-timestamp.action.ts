import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class UpdateLayoutLastWebsocketMessageTimestampAction implements Action {
  readonly type = actionTypes.UPDATE_LAYOUT_LAST_WS_MSG_TS;

  constructor(public payload: number) {
  }
}
