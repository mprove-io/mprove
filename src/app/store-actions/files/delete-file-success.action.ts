import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';

export class DeleteFileSuccessAction implements Action {
  readonly type = actionTypes.DELETE_FILE_SUCCESS;

  constructor(public payload: api.DeleteFileResponse200Body['payload']) {}
}
