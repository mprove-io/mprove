import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class DeleteProjectAction implements Action {
  readonly type = actionTypes.DELETE_PROJECT;

  constructor(public payload: api.DeleteProjectRequestBodyPayload) {
  }
}
