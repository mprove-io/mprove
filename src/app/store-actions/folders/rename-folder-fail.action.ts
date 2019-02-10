import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class RenameFolderFailAction implements Action {
  readonly type = actionTypes.RENAME_FOLDER_FAIL;

  constructor(public payload: { error: any }) {}
}
