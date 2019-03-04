import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';
import * as api from '@app/api/_index';

export class CreateProjectSuccessAction implements Action {
  readonly type = actionTypes.CREATE_PROJECT_SUCCESS;

  constructor(public payload: api.CreateProjectResponse200Body['payload']) {}
}
