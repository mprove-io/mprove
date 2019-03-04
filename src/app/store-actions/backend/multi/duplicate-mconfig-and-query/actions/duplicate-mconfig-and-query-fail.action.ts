import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class DuplicateMconfigAndQueryFailAction implements Action {
  readonly type = actionTypes.DUPLICATE_MCONFIG_AND_QUERY_FAIL;

  constructor(public payload: { error: any }) {}
}
