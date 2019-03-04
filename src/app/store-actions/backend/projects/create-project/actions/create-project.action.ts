import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';
import * as api from '@app/api/_index';

export class CreateProjectAction implements Action {
  readonly type = actionTypes.CREATE_PROJECT;

  constructor(public payload: api.CreateProjectRequestBody['payload']) {}
}
