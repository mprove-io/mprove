import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';

export class SetLiveQueriesAction implements Action {
  readonly type = actionTypes.SET_LIVE_QUERIES;

  constructor(public payload: api.SetLiveQueriesRequestBody['payload']) {}
}
