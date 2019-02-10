import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class DeleteFolderFailAction implements Action {
  readonly type = actionTypes.DELETE_FOLDER_FAIL;

  constructor(public payload: { error: any }) {}
}
