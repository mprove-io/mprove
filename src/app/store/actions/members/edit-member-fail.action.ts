import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class EditMemberFailAction implements Action {
  readonly type = actionTypes.EDIT_MEMBER_FAIL;

  constructor(public payload: { error: any }) {
  }
}
