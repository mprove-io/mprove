import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class CreateDashboardFailAction implements Action {
  readonly type = actionTypes.CREATE_DASHBOARD_FAIL;

  constructor(public payload: { error: any }) {
  }
}
