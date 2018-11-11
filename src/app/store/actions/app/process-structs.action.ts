import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class ProcessStructsAction implements Action {

  type = actionTypes.PROCESS_STRUCTS;

  constructor(public payload: api.Struct[]) {
  }
}
