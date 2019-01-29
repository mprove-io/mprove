import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store/action-types';

export class CleanMconfigsStateAction implements Action {
  readonly type = actionTypes.CLEAN_MCONFIGS_STATE;

  constructor(
    public payload: { project_id: string; repo_id: string; struct_id: string }
  ) {}
}
