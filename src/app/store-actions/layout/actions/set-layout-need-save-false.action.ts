import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class SetLayoutNeedSaveFalseAction implements Action {
  readonly type = actionTypes.SET_LAYOUT_NEED_SAVE_FALSE;

  constructor() {}
}
