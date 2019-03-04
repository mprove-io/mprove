import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';
import * as api from '@app/api/_index';

export class SetProjectCredentialsSuccessAction implements Action {
  readonly type = actionTypes.SET_PROJECT_CREDENTIALS_SUCCESS;

  constructor(
    public payload: api.SetProjectCredentialsResponse200Body['payload']
  ) {}
}
