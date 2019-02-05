import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class DeleteMemberAction implements Action {
  readonly type = actionTypes.DELETE_MEMBER;

  constructor(public payload: api.DeleteMemberRequestBody['payload']) {}
}
