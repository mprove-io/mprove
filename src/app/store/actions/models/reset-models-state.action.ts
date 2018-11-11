import { Action } from '@ngrx/store';
import * as actionTypes from 'app/store/action-types';

export class ResetModelsStateAction implements Action {
  readonly type = actionTypes.RESET_MODELS_STATE;

  constructor() {
  }
}
