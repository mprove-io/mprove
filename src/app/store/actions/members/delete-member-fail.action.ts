import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class DeleteMemberFailAction implements Action {
  readonly type = actionTypes.DELETE_MEMBER_FAIL;

  constructor(public payload: { error: any }) {}
}
