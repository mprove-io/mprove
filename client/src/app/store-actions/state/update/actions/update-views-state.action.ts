import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class UpdateViewsStateAction implements Action {
  readonly type = actionTypes.UPDATE_VIEWS_STATE;

  constructor(public payload: api.View[]) {}
}
