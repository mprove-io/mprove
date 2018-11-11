import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class PingReceivedAction implements Action {
  readonly type = actionTypes.PING_RECEIVED;

  constructor(public payload: api.PingRequestBody) {
  }
}
