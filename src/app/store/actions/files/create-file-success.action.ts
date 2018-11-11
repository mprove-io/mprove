import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class CreateFileSuccessAction implements Action {
  readonly type = actionTypes.CREATE_FILE_SUCCESS;

  constructor(public payload: api.CreateFileResponse200BodyPayload) {
  }
}
