import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class SetProjectTimezoneSuccessAction implements Action {
  readonly type = actionTypes.SET_PROJECT_TIMEZONE_SUCCESS;

  constructor(public payload: api.SetProjectTimezoneResponse200BodyPayload) {
  }
}
