import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class DeleteFileAction implements Action {
  readonly type = actionTypes.DELETE_FILE;

  constructor(public payload: api.DeleteFileRequestBodyPayload) {}
}
