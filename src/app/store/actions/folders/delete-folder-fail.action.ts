import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class DeleteFolderFailAction implements Action {
  readonly type = actionTypes.DELETE_FOLDER_FAIL;

  constructor(public payload: { error: any }) {
  }
}
