import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class SetProjectCredentialsAction implements Action {
  readonly type = actionTypes.SET_PROJECT_CREDENTIALS;

  constructor(public payload: api.SetProjectCredentialsRequestBodyPayload) {}
}
