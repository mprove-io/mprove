import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class RenameFolderSuccessAction implements Action {
  readonly type = actionTypes.RENAME_FOLDER_SUCCESS;

  constructor(public payload: api.RenameFolderResponse200BodyPayload) {
  }
}
