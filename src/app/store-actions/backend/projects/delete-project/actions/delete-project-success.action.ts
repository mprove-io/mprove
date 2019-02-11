import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';
import * as api from '@app/api/_index';

export class DeleteProjectSuccessAction implements Action {
  readonly type = actionTypes.DELETE_PROJECT_SUCCESS;

  constructor(public payload: api.DeleteProjectResponse200Body['payload']) {}
}
