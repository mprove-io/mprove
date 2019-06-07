import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';
import * as api from '@app/api/_index';

export class SetProjectConnectionFailAction implements Action {
  readonly type = actionTypes.SET_PROJECT_CONNECTION_FAIL;

  constructor(public payload: { error: any }) {}
}
