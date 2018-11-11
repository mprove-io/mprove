import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class UpdateLayoutFileIdAction implements Action {
  readonly type = actionTypes.UPDATE_LAYOUT_FILE_ID;

  constructor(public payload: string) {
  }
}
