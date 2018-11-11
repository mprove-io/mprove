import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class SetLiveQueriesAction implements Action {
  readonly type = actionTypes.SET_LIVE_QUERIES;

  constructor(public payload: api.SetLiveQueriesRequestBodyPayload) {
  }
}
