import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-action-types/index';

export class UpdateLayoutFileIdAction implements Action {
  readonly type = actionTypes.UPDATE_LAYOUT_FILE_ID;

  constructor(public payload: string) {}
}
