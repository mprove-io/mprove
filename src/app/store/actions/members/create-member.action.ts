import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class CreateMemberAction implements Action {
  readonly type = actionTypes.CREATE_MEMBER;

  constructor(public payload: api.CreateMemberRequestBodyPayload) {}
}
