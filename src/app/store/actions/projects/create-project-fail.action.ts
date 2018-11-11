import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class CreateProjectFailAction implements Action {
  readonly type = actionTypes.CREATE_PROJECT_FAIL;

  constructor(public payload: { error: any }) {
  }
}
