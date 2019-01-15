import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';

@Injectable()
export class ResetUserPasswordFailEffect {
  @Effect() resetUserPasswordFail$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.RESET_USER_PASSWORD_FAIL),
    mergeMap((action: actions.ResetUserPasswordFailAction) => {
      return of(new actions.BackendFailAction({ error: action.payload.error }));
    })
  );

  constructor(private actions$: Actions) {}
}
