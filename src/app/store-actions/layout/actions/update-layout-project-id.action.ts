import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class UpdateLayoutProjectIdAction implements Action {
  readonly type = actionTypes.UPDATE_LAYOUT_PROJECT_ID;

  constructor(public payload: string) {}
}
