import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class ResetDashboardsStateAction implements Action {
  readonly type = actionTypes.RESET_DASHBOARDS_STATE;

  constructor() {}
}
