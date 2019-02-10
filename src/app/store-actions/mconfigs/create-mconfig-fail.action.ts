import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class CreateMconfigFailAction implements Action {
  readonly type = actionTypes.CREATE_MCONFIG_FAIL;

  constructor(public payload: { error: any }) {}
}
