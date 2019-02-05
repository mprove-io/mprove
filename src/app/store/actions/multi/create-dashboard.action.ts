import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class CreateDashboardAction implements Action {
  readonly type = actionTypes.CREATE_DASHBOARD;

  constructor(public payload: api.CreateDashboardRequestBody['payload']) {}
}
