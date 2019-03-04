import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class DeleteUserFailAction implements Action {
  readonly type = actionTypes.DELETE_USER_FAIL;

  constructor(public payload: { error: any }) {}
}
