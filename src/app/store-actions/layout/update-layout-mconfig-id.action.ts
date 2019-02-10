import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class UpdateLayoutMconfigIdAction implements Action {
  readonly type = actionTypes.UPDATE_LAYOUT_MCONFIG_ID;

  constructor(public payload: string) {}
}
