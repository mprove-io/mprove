import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';

export class UpdateModelsStateAction implements Action {
  readonly type = actionTypes.UPDATE_MODELS_STATE;

  constructor(public payload: api.Model[]) {}
}
