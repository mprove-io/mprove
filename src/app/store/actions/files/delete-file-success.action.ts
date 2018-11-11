import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class DeleteFileSuccessAction implements Action {
  readonly type = actionTypes.DELETE_FILE_SUCCESS;

  constructor(public payload: api.DeleteFileResponse200BodyPayload) {
  }
}
