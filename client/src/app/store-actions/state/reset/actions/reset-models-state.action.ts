import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class ResetModelsStateAction implements Action {
  readonly type = actionTypes.RESET_MODELS_STATE;

  constructor() {}
}
