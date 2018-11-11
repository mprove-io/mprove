import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class SetUserNameSuccessAction implements Action {
  readonly type = actionTypes.SET_USER_NAME_SUCCESS;

  constructor(public payload: api.SetUserNameResponse200BodyPayload) { // for effects
  }
}
