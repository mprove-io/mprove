import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class CreateMconfigSuccessAction implements Action {
  readonly type = actionTypes.CREATE_MCONFIG_SUCCESS;

  constructor(public payload: api.CreateMconfigResponse200BodyPayload) {}
}
