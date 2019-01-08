import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as services from 'app/services/_index';

@Injectable()
export class LoginUserEffect {
  @Effect() loginUser$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.LOGIN_USER),
    mergeMap((action: actions.LoginUserAction) =>
      this.backendService.loginUser(action.payload).pipe(
        map(body => new actions.LoginUserSuccessAction(body.payload)),
        catchError(e => of(new actions.LoginUserFailAction({ error: e })))
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
