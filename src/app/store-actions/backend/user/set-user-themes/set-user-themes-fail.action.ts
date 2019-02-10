import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class SetUserThemesFailAction implements Action {
  readonly type = actionTypes.SET_USER_THEMES_FAIL;

  constructor(public payload: { error: any }) {}
}
