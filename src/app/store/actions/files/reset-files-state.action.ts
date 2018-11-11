import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class ResetFilesStateAction implements Action {
  readonly type = actionTypes.RESET_FILES_STATE;

  constructor() {
  }
}
