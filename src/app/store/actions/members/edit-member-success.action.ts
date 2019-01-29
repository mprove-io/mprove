import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class EditMemberSuccessAction implements Action {
  readonly type = actionTypes.EDIT_MEMBER_SUCCESS;

  constructor(public payload: api.EditMemberResponse200BodyPayload) {}
}
