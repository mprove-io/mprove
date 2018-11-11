import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';

@Injectable()
export class SetUserTimezoneSuccessEffect {

  @Effect() setUserTimezoneSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.SET_USER_TIMEZONE_SUCCESS)
    .pipe(
      mergeMap((action: actions.SetUserTimezoneSuccessAction) => from([
        new actions.UpdateUserStateAction(action.payload.user),
      ])
      )
    );

  constructor(
    private actions$: Actions) {
  }

}
