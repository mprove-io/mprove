import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';
import * as api from '@app/api/_index';

export class DeleteProjectAction implements Action {
  readonly type = actionTypes.DELETE_PROJECT;

  constructor(public payload: api.DeleteProjectRequestBody['payload']) {}
}

export class DeleteProjectSuccessAction implements Action {
  readonly type = actionTypes.DELETE_PROJECT_SUCCESS;

  constructor(public payload: api.DeleteProjectResponse200Body['payload']) {}
}

export class DeleteProjectFailAction implements Action {
  readonly type = actionTypes.DELETE_PROJECT_FAIL;

  constructor(public payload: { error: any }) {}
}
