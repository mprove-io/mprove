import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class ResetDashboardsStateAction implements Action {
  readonly type = actionTypes.RESET_DASHBOARDS_STATE;

  constructor() {
  }
}
