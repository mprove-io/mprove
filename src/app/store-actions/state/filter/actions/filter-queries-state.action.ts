import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class FilterQueriesStateAction implements Action {
  readonly type = actionTypes.FILTER_QUERIES_STATE;

  constructor(public payload: { project_id: string; query_ids: string[] }) {}
}
