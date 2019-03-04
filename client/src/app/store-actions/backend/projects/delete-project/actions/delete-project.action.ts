import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';
import * as api from '@app/api/_index';

export class DeleteProjectAction implements Action {
  readonly type = actionTypes.DELETE_PROJECT;

  constructor(public payload: api.DeleteProjectRequestBody['payload']) {}
}
