import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class UpdateLayoutDashboardIdAction implements Action {
  readonly type = actionTypes.UPDATE_LAYOUT_DASHBOARD_ID;

  constructor(public payload: string) {}
}
