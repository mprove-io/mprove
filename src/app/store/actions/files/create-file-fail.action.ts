import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store/action-types';

export class CreateFileFailAction implements Action {
  readonly type = actionTypes.CREATE_FILE_FAIL;

  constructor(public payload: { error: any }) {}
}
