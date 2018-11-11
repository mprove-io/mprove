import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class RevertRepoToLastCommitAction implements Action {
  readonly type = actionTypes.REVERT_REPO_TO_LAST_COMMIT;

  constructor(public payload: api.RevertRepoToLastCommitRequestBodyPayload) {
  }
}
