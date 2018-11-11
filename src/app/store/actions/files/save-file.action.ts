import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class SaveFileAction implements Action {
  readonly type = actionTypes.SAVE_FILE;

  constructor(public payload: api.SaveFileRequestBodyPayload) {
  }
}
