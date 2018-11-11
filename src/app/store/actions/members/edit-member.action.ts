import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class EditMemberAction implements Action {
  readonly type = actionTypes.EDIT_MEMBER;

  constructor(public payload: api.EditMemberRequestBodyPayload) {
  }
}
