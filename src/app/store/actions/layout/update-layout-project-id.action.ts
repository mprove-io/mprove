import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class UpdateLayoutProjectIdAction implements Action {
  readonly type = actionTypes.UPDATE_LAYOUT_PROJECT_ID;

  constructor(public payload: string) {
  }
}
