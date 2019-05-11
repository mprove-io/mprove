import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class ResetViewsStateAction implements Action {
  readonly type = actionTypes.RESET_VIEWS_STATE;

  constructor() {}
}
