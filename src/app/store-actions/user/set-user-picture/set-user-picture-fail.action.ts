import { Action } from '@ngrx/store';
import * as actionTypes from '@app/store-actions/action-types';

export class SetUserPictureFailAction implements Action {
  readonly type = actionTypes.SET_USER_PICTURE_FAIL;

  constructor(public payload: { error: any }) {}
}
