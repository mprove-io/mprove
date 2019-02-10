import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class SaveFileFailAction implements Action {
  readonly type = actionTypes.SAVE_FILE_FAIL;

  constructor(public payload: { error: any }) {}
}
