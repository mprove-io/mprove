import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class UpdateMembersStateAction implements Action {
  readonly type = actionTypes.UPDATE_MEMBERS_STATE;

  constructor(public payload: api.Member[]) {}
}
