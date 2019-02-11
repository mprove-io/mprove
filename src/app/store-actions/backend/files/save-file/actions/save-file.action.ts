import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class SaveFileAction implements Action {
  readonly type = actionTypes.SAVE_FILE;

  constructor(public payload: api.SaveFileRequestBody['payload']) {}
}
