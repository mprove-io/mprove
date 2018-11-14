import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class CreateMemberSuccessAction implements Action {
  readonly type = actionTypes.CREATE_MEMBER_SUCCESS;

  constructor(public payload: api.CreateMemberResponse200BodyPayload) {}
}
