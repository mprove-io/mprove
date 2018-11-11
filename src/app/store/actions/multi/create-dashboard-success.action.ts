import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class CreateDashboardSuccessAction implements Action {
  readonly type = actionTypes.CREATE_DASHBOARD_SUCCESS;

  constructor(public payload: api.CreateDashboardResponse200BodyPayload) {
  }
}
