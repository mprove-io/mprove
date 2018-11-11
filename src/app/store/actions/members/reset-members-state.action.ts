import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class ResetMembersStateAction implements Action {
  readonly type = actionTypes.RESET_MEMBERS_STATE;

  constructor() {
  }
}
