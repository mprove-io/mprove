import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';

export class DeleteFolderSuccessAction implements Action {
  readonly type = actionTypes.DELETE_FOLDER_SUCCESS;

  constructor(public payload: api.DeleteFolderResponse200Body['payload']) {}
}
