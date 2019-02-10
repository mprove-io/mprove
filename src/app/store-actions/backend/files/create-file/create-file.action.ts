import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class CreateFileAction implements Action {
  readonly type = actionTypes.CREATE_FILE;

  constructor(public payload: api.CreateFileRequestBody['payload']) {}
}
