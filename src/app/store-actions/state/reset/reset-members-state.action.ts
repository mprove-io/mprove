import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class ResetMembersStateAction implements Action {
  readonly type = actionTypes.RESET_MEMBERS_STATE;

  constructor() {}
}
