import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';

@Injectable()
export class SetUserPictureSuccessEffect {

  @Effect() saveUserPictureSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.SET_USER_PICTURE_SUCCESS)
    .pipe(
      mergeMap((action: actions.SetUserPictureSuccessAction) => from([
        new actions.UpdateUserStateAction(action.payload.user),
        new actions.UpdateMembersStateAction(action.payload.members),
      ])
      )
    );

  constructor(
    private actions$: Actions) {
  }

}
