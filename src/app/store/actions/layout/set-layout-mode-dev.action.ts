import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class SetLayoutModeDevAction implements Action {
  readonly type = actionTypes.SET_LAYOUT_MODE_DEV;

  constructor() {
  }
}
