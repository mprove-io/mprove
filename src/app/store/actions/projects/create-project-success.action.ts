import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class CreateProjectSuccessAction implements Action {
  readonly type = actionTypes.CREATE_PROJECT_SUCCESS;

  constructor(public payload: api.CreateProjectResponse200BodyPayload) {}
}
