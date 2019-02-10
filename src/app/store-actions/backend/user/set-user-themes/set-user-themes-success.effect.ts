import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';

@Injectable()
export class SetUserThemesSuccessEffect {
  @Effect() setUserThemesSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.SET_USER_THEMES_SUCCESS),
    mergeMap((action: actions.SetUserThemesSuccessAction) =>
      from([new actions.UpdateUserStateAction(action.payload.user)])
    )
  );

  constructor(private actions$: Actions) {}
}
