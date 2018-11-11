import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class SetProjectCredentialsSuccessAction implements Action {
  readonly type = actionTypes.SET_PROJECT_CREDENTIALS_SUCCESS;

  constructor(public payload: api.SetProjectCredentialsResponse200BodyPayload) {
  }
}
