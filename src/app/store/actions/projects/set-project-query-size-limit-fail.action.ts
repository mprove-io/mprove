import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class SetProjectQuerySizeLimitFailAction implements Action {
  readonly type = actionTypes.SET_PROJECT_QUERY_SIZE_LIMIT_FAIL;

  constructor(public payload: { error: any }) {}
}
