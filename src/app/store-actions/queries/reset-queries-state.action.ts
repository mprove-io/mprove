import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class ResetQueriesStateAction implements Action {
  readonly type = actionTypes.RESET_QUERIES_STATE;

  constructor() {}
}
