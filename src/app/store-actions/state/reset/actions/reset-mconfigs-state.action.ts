import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class ResetMconfigsStateAction implements Action {
  readonly type = actionTypes.RESET_MCONFIGS_STATE;

  constructor() {}
}
