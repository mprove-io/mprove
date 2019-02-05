import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class MoveFileSuccessAction implements Action {
  readonly type = actionTypes.MOVE_FILE_SUCCESS;

  constructor(public payload: api.MoveFileResponse200Body['payload']) {}
}
