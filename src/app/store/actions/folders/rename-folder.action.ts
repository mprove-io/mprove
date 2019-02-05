import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class RenameFolderAction implements Action {
  readonly type = actionTypes.RENAME_FOLDER;

  constructor(public payload: api.RenameFolderRequestBody['payload']) {}
}
