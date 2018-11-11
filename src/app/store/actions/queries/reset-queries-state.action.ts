import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class ResetQueriesStateAction implements Action {
  readonly type = actionTypes.RESET_QUERIES_STATE;

  constructor() {
  }
}
