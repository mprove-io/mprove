import { Action } from '@ngrx/store';
import * as api from 'src/app/api/_index';
import * as actionTypes from 'src/app/store/action-types';

export class SetUserPictureSuccessAction implements Action {
  readonly type = actionTypes.SET_USER_PICTURE_SUCCESS;

  constructor(public payload: api.SetUserPictureResponse200BodyPayload) { // for effects
  }
}
