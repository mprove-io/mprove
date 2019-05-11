import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class CleanViewsStateAction implements Action {
  readonly type = actionTypes.CLEAN_VIEWS_STATE;

  constructor(
    public payload: { project_id: string; repo_id: string; struct_id: string }
  ) {}
}
