import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class CancelSubscriptionsAction implements Action {
  readonly type = actionTypes.CANCEL_SUBSCRIPTIONS;

  constructor(public payload: api.CancelSubscriptionsRequestBodyPayload) {}
}
