import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store/action-types';

export class SetProjectCredentialsFailAction implements Action {
  readonly type = actionTypes.SET_PROJECT_CREDENTIALS_FAIL;

  constructor(public payload: { error: any }) {}
}
