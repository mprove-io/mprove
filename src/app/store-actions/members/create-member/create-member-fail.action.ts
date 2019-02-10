import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class CreateMemberFailAction implements Action {
  readonly type = actionTypes.CREATE_MEMBER_FAIL;

  constructor(public payload: { error: any }) {}
}
