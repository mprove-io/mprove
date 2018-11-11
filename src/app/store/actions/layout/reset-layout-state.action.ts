import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class ResetLayoutStateAction implements Action {
  readonly type = actionTypes.RESET_LAYOUT_STATE;

  constructor() {
  }
}
