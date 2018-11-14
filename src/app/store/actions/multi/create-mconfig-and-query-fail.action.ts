import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class CreateMconfigAndQueryFailAction implements Action {
  readonly type = actionTypes.CREATE_MCONFIG_AND_QUERY_FAIL;

  constructor(public payload: { error: any }) {}
}
