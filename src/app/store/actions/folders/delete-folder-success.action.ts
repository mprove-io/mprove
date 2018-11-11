import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class DeleteFolderSuccessAction implements Action {
  readonly type = actionTypes.DELETE_FOLDER_SUCCESS;

  constructor(public payload: api.DeleteFolderResponse200BodyPayload) {
  }
}
