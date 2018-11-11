import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class UpdateQueriesStateAction implements Action {
  readonly type = actionTypes.UPDATE_QUERIES_STATE;

  constructor(public payload: api.Query[]) {
  }
}
