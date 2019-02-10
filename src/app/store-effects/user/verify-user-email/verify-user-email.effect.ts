import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as actionTypes from '@app/store-action-types/index';
import * as services from '@app/services/_index';

@Injectable()
export class VerifyUserEmailEffect {
  @Effect() verifyUserEmail$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.VERIFY_USER_EMAIL),
    mergeMap((action: actions.VerifyUserEmailAction) =>
      this.backendService.verifyUserEmail(action.payload).pipe(
        map(body => new actions.VerifyUserEmailSuccessAction(body.payload)),
        catchError(e => of(new actions.VerifyUserEmailFailAction({ error: e })))
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
