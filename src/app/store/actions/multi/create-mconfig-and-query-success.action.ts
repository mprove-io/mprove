import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class CreateMconfigAndQuerySuccessAction implements Action {
  readonly type = actionTypes.CREATE_MCONFIG_AND_QUERY_SUCCESS;

  constructor(public payload: api.CreateMconfigAndQueryResponse200BodyPayload) {
  }
}
