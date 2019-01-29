import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store/actions/_index';
import * as actionTypes from '@app/store/action-types';

@Injectable()
export class VerifyUserEmailFailEffect {
  @Effect() verifyUserEmailFail$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.VERIFY_USER_EMAIL_FAIL),
    mergeMap((action: actions.VerifyUserEmailFailAction) => {
      return of(new actions.BackendFailAction({ error: action.payload.error }));
    })
  );

  constructor(private actions$: Actions) {}
}
