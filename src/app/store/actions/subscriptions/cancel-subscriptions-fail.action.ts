import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class CancelSubscriptionsFailAction implements Action {
  readonly type = actionTypes.CANCEL_SUBSCRIPTIONS_FAIL;

  constructor(public payload: { error: any }) {
  }
}
