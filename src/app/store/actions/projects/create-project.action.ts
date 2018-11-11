import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class CreateProjectAction implements Action {
  readonly type = actionTypes.CREATE_PROJECT;

  constructor(public payload: api.CreateProjectRequestBodyPayload) {
  }
}
