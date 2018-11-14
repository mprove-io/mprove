import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class SetUserNameFailAction implements Action {
  readonly type = actionTypes.SET_USER_NAME_FAIL;

  constructor(public payload: { error: any }) {}
}
