import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class CancelSubscriptionsSuccessAction implements Action {
  readonly type = actionTypes.CANCEL_SUBSCRIPTIONS_SUCCESS;

  constructor(public payload: api.CancelSubscriptionsResponse200BodyPayload) {
  }
}
