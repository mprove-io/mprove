import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class RevertRepoToProductionSuccessAction implements Action {
  readonly type = actionTypes.REVERT_REPO_TO_PRODUCTION_SUCCESS;

  constructor(
    public payload: api.RevertRepoToProductionResponse200Body['payload']
  ) {}
}
