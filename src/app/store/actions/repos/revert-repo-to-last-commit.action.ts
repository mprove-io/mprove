import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class RevertRepoToLastCommitAction implements Action {
  readonly type = actionTypes.REVERT_REPO_TO_LAST_COMMIT;

  constructor(
    public payload: api.RevertRepoToLastCommitRequestBody['payload']
  ) {}
}
