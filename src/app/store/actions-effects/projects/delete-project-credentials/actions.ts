import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store/action-types';
import * as api from '@app/api/_index';

export class DeleteProjectCredentialsFailAction implements Action {
  readonly type = actionTypes.DELETE_PROJECT_CREDENTIALS_FAIL;

  constructor(public payload: { error: any }) {}
}

export class DeleteProjectCredentialsSuccessAction implements Action {
  readonly type = actionTypes.DELETE_PROJECT_CREDENTIALS_SUCCESS;

  constructor(
    public payload: api.DeleteProjectCredentialsResponse200Body['payload']
  ) {}
}

export class DeleteProjectCredentialsAction implements Action {
  readonly type = actionTypes.DELETE_PROJECT_CREDENTIALS;

  constructor(
    public payload: api.DeleteProjectCredentialsRequestBody['payload']
  ) {}
}
