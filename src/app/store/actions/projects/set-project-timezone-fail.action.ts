import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class SetProjectTimezoneFailAction implements Action {
  readonly type = actionTypes.SET_PROJECT_TIMEZONE_FAIL;

  constructor(public payload: { error: any }) {
  }
}
