import { Action } from '@ngrx/store';
import * as actionTypes from 'src/app/store/action-types';

export class SetUserPictureFailAction implements Action {
  readonly type = actionTypes.SET_USER_PICTURE_FAIL;

  constructor(public payload: { error: any }) {
  }
}
