import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class CreateFolderAction implements Action {
  readonly type = actionTypes.CREATE_FOLDER;

  constructor(public payload: api.CreateFolderRequestBodyPayload) {
  }
}
