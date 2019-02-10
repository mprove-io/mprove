import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class ResetLayoutStateAction implements Action {
  readonly type = actionTypes.RESET_LAYOUT_STATE;

  constructor() {}
}
