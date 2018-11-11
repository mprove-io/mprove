import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class SetProjectWeekStartFailAction implements Action {
  readonly type = actionTypes.SET_PROJECT_WEEK_START_FAIL;

  constructor(public payload: { error: any }) {
  }
}
