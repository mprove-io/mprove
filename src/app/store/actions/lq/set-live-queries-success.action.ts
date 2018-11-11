import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class SetLiveQueriesSuccessAction implements Action {
  readonly type = actionTypes.SET_LIVE_QUERIES_SUCCESS;

  constructor(public payload: api.SetLiveQueriesResponse200BodyPayload) {
  }
}
