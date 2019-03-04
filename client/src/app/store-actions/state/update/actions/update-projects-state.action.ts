import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class UpdateProjectsStateAction implements Action {
  readonly type = actionTypes.UPDATE_PROJECTS_STATE;

  constructor(public payload: api.Project[]) {}
}
