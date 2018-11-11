import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class DeleteFileFailAction implements Action {
  readonly type = actionTypes.DELETE_FILE_FAIL;

  constructor(public payload: { error: any }) {
  }
}
