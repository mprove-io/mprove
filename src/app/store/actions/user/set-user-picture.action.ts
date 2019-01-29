import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';

export class SetUserPictureAction implements Action {
  readonly type = actionTypes.SET_USER_PICTURE;

  constructor(public payload: api.SetUserPictureRequestBodyPayload) {}
}
