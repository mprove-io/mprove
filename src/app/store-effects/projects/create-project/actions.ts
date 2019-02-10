import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';
import * as api from '@app/api/_index';

export class CreateProjectAction implements Action {
  readonly type = actionTypes.CREATE_PROJECT;

  constructor(public payload: api.CreateProjectRequestBody['payload']) {}
}

export class CreateProjectSuccessAction implements Action {
  readonly type = actionTypes.CREATE_PROJECT_SUCCESS;

  constructor(public payload: api.CreateProjectResponse200Body['payload']) {}
}

export class CreateProjectFailAction implements Action {
  readonly type = actionTypes.CREATE_PROJECT_FAIL;

  constructor(public payload: { error: any }) {}
}
