import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class DeleteMemberSuccessAction implements Action {
  readonly type = actionTypes.DELETE_MEMBER_SUCCESS;

  constructor(public payload: api.DeleteMemberResponse200Body['payload']) {}
}
