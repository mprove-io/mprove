import { Action } from '@ngrx/store';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-action-types/index';

export class SetUserPictureSuccessAction implements Action {
  readonly type = actionTypes.SET_USER_PICTURE_SUCCESS;

  constructor(public payload: api.SetUserPictureResponse200Body['payload']) {
    // for effects
  }
}
