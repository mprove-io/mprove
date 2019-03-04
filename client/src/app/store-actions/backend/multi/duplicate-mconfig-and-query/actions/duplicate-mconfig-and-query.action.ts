import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';

export class DuplicateMconfigAndQueryAction implements Action {
  readonly type = actionTypes.DUPLICATE_MCONFIG_AND_QUERY;

  constructor(
    public payload: api.DuplicateMconfigAndQueryRequestBody['payload']
  ) {}
}
