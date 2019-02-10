import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class EditMemberAction implements Action {
  readonly type = actionTypes.EDIT_MEMBER;

  constructor(public payload: api.EditMemberRequestBody['payload']) {}
}
