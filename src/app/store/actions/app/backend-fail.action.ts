import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store/action-types';

export class BackendFailAction implements Action {
  type = actionTypes.BACKEND_FAIL;

  constructor(public payload: { error: any }) {}
}
