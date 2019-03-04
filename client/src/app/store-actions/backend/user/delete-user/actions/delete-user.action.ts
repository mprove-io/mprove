import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class DeleteUserAction implements Action {
  readonly type = actionTypes.DELETE_USER;

  constructor(public payload: api.DeleteUserRequestBody['payload']) {}
}
