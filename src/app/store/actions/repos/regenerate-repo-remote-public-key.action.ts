import { Action } from '@ngrx/store';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';

export class RegenerateRepoRemotePublicKeyAction implements Action {
  readonly type = actionTypes.REGENERATE_REPO_REMOTE_PUBLIC_KEY;

  constructor(
    public payload: api.RegenerateRepoRemotePublicKeyRequestBodyPayload
  ) {}
}
