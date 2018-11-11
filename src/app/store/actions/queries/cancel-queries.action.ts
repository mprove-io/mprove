import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class CancelQueriesAction implements Action {
  readonly type = actionTypes.CANCEL_QUERIES;

  constructor(public payload: api.CancelQueriesRequestBodyPayload) {
  }
}
