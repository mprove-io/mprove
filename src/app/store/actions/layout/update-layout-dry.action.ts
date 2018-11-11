import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';
import * as interfaces from 'src/app/interfaces/_index';

export class UpdateLayoutDryAction implements Action {
  readonly type = actionTypes.UPDATE_LAYOUT_DRY;

  constructor(public payload: interfaces.Dry) {
  }
}
