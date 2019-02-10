import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class SetLayoutNeedSaveFalseAction implements Action {
  readonly type = actionTypes.SET_LAYOUT_NEED_SAVE_FALSE;

  constructor() {}
}
