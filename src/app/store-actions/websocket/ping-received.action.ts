import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';

export class PingReceivedAction implements Action {
  readonly type = actionTypes.PING_RECEIVED;

  constructor(public payload: api.PingRequestBody) {}
}
