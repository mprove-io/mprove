import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class DeleteUserSuccessAction implements Action {
  readonly type = actionTypes.DELETE_USER_SUCCESS;

  constructor(public payload: api.DeleteUserResponse200Body['payload']) {
    // for effects
  }
}
