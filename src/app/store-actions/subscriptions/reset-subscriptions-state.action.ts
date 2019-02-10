import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class ResetSubscriptionsStateAction implements Action {
  readonly type = actionTypes.RESET_SUBSCRIPTIONS_STATE;

  constructor() {}
}
