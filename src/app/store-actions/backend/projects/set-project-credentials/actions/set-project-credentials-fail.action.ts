import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';
import * as api from '@app/api/_index';

export class SetProjectCredentialsFailAction implements Action {
  readonly type = actionTypes.SET_PROJECT_CREDENTIALS_FAIL;

  constructor(public payload: { error: any }) {}
}
