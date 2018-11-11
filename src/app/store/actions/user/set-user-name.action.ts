import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class SetUserNameAction implements Action {
  readonly type = actionTypes.SET_USER_NAME;

  constructor(public payload: api.SetUserNameRequestBodyPayload) {
  }
}
