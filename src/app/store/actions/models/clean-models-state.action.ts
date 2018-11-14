import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class CleanModelsStateAction implements Action {
  readonly type = actionTypes.CLEAN_MODELS_STATE;

  constructor(
    public payload: { project_id: string; repo_id: string; struct_id: string }
  ) {}
}
