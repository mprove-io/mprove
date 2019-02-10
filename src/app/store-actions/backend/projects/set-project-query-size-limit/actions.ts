import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';
import * as api from '@app/api/_index';

export class SetProjectQuerySizeLimitAction implements Action {
  readonly type = actionTypes.SET_PROJECT_QUERY_SIZE_LIMIT;

  constructor(
    public payload: api.SetProjectQuerySizeLimitRequestBody['payload']
  ) {}
}

export class SetProjectQuerySizeLimitSuccessAction implements Action {
  readonly type = actionTypes.SET_PROJECT_QUERY_SIZE_LIMIT_SUCCESS;

  constructor(
    public payload: api.SetProjectQuerySizeLimitResponse200Body['payload']
  ) {}
}

export class SetProjectQuerySizeLimitFailAction implements Action {
  readonly type = actionTypes.SET_PROJECT_QUERY_SIZE_LIMIT_FAIL;

  constructor(public payload: { error: any }) {}
}
