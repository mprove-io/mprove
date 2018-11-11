import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class UpdateSubscriptionsStateAction implements Action {
  readonly type = actionTypes.UPDATE_SUBSCRIPTIONS_STATE;

  constructor(public payload: api.Subscription[]) {
  }
}
