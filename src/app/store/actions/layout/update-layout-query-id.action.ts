import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class UpdateLayoutQueryIdAction implements Action {
  readonly type = actionTypes.UPDATE_LAYOUT_QUERY_ID;

  constructor(public payload: string) {}
}
