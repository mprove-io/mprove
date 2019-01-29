import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from '@app/store/actions/_index';
import * as actionTypes from '@app/store/action-types';
import * as services from '@app/services/_index';

@Injectable()
export class ResetUserPasswordEffect {
  @Effect() resetUserPassword$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.RESET_USER_PASSWORD),
    mergeMap((action: actions.ResetUserPasswordAction) =>
      this.backendService.resetUserPassword(action.payload).pipe(
        map(body => new actions.ResetUserPasswordSuccessAction(body.payload)),
        catchError(e =>
          of(new actions.ResetUserPasswordFailAction({ error: e }))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
