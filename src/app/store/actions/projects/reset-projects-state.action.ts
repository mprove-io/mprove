import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class ResetProjectsStateAction implements Action {
  readonly type = actionTypes.RESET_PROJECTS_STATE;

  constructor() {
  }
}
