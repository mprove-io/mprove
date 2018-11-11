import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class CreateFolderFailAction implements Action {

  readonly type = actionTypes.CREATE_FOLDER_FAIL;

  constructor(public payload: { error: any }) {
  }
}
