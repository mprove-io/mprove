import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class SaveFileSuccessAction implements Action {
  readonly type = actionTypes.SAVE_FILE_SUCCESS;

  constructor(public payload: api.SaveFileResponse200BodyPayload) {
  }
}
