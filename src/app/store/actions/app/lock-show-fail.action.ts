import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class LockShowFailAction implements Action {

  type = actionTypes.LOCK_SHOW_FAIL;

  constructor(public payload: { error: any }) {
  }
}
