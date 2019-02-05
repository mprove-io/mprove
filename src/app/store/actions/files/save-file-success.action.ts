import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class SaveFileSuccessAction implements Action {
  readonly type = actionTypes.SAVE_FILE_SUCCESS;

  constructor(public payload: api.SaveFileResponse200Body['payload']) {}
}
