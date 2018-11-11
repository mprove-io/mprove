import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class CreateFolderSuccessAction implements Action {

  readonly type = actionTypes.CREATE_FOLDER_SUCCESS;

  constructor(public payload: api.CreateFolderResponse200BodyPayload) {
  }
}
