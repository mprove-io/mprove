import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';

export class SetUserThemesSuccessAction implements Action {
  readonly type = actionTypes.SET_USER_THEMES_SUCCESS;

  constructor(public payload: api.SetUserThemesResponse200Body['payload']) {
    // for effects
  }
}
