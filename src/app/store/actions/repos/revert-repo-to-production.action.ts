import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class RevertRepoToProductionAction implements Action {
  readonly type = actionTypes.REVERT_REPO_TO_PRODUCTION;

  constructor(public payload: api.RevertRepoToProductionRequestBodyPayload) {}
}
