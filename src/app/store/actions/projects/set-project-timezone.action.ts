import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class SetProjectTimezoneAction implements Action {
  readonly type = actionTypes.SET_PROJECT_TIMEZONE;

  constructor(public payload: api.SetProjectTimezoneRequestBodyPayload) {}
}
