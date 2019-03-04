import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';
import * as api from '@app/api/_index';

export class CreateProjectFailAction implements Action {
  readonly type = actionTypes.CREATE_PROJECT_FAIL;

  constructor(public payload: { error: any }) {}
}
