import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store/action-types';

export class DeleteProjectFailAction implements Action {
  readonly type = actionTypes.DELETE_PROJECT_FAIL;

  constructor(public payload: { error: any }) {}
}
