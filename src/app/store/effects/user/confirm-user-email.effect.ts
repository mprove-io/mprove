import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as services from 'app/services/_index';

@Injectable()
export class ConfirmUserEmailEffect {
  @Effect() confirmUserEmail$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.CONFIRM_USER_EMAIL),
    mergeMap((action: actions.ConfirmUserEmailAction) =>
      this.backendService.confirmUserEmail(action.payload).pipe(
        map(body => new actions.ConfirmUserEmailSuccessAction(body.payload)),
        catchError(e =>
          of(new actions.ConfirmUserEmailFailAction({ error: e }))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
