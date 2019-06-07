import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';
import * as api from '@app/api/_index';

export class SetProjectConnectionSuccessAction implements Action {
  readonly type = actionTypes.SET_PROJECT_CONNECTION_SUCCESS;

  constructor(
    public payload: api.SetProjectConnectionResponse200Body['payload']
  ) {}
}
