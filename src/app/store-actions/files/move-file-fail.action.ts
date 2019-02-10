import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class MoveFileFailAction implements Action {
  readonly type = actionTypes.MOVE_FILE_FAIL;

  constructor(public payload: { error: any }) {}
}
