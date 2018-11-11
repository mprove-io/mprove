import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class EditMemberAction implements Action {
  readonly type = actionTypes.EDIT_MEMBER;

  constructor(public payload: api.EditMemberRequestBodyPayload) {
  }
}
