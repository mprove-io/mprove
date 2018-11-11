import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class UpdateLayoutModelIdAction implements Action {
  readonly type = actionTypes.UPDATE_LAYOUT_MODEL_ID;

  constructor(public payload: string) {
  }
}
