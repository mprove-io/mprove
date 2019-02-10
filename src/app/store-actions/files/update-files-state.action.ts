import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';

export class UpdateFilesStateAction implements Action {
  readonly type = actionTypes.UPDATE_FILES_STATE;

  constructor(public payload: api.CatalogFile[]) {}
}
