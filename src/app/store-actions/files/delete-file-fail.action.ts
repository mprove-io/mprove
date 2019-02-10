import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class DeleteFileFailAction implements Action {
  readonly type = actionTypes.DELETE_FILE_FAIL;

  constructor(public payload: { error: any }) {}
}
