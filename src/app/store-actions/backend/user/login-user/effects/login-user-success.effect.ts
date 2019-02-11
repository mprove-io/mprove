import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';
import * as services from '@app/services/_index';
import * as interfaces from '@app/interfaces/_index';
import { Router } from '@angular/router';

@Injectable()
export class LoginUserSuccessEffect {
  @Effect({ dispatch: false }) loginUserSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.LOGIN_USER_SUCCESS),
    tap((action: actions.LoginUserSuccessAction) => {
      this.watchAuthenticationService.stop();

      if (action.payload.email_verified === true) {
        localStorage.setItem('token', action.payload.token);
        this.router.navigate(['profile']);
      } else if (action.payload.email_verified === false) {
        this.store.dispatch(
          new actions.UpdateLayoutEmailToVerifyAction(action.payload.user_id)
        );

        this.router.navigate(['verify-email-sent']);
      }
    })
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private store: Store<interfaces.AppState>,
    private watchAuthenticationService: services.WatchAuthenticationService
  ) {}
}
