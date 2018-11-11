import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as interfaces from 'app/interfaces/_index';
import * as services from 'app/services/_index';

@Injectable()
export class UserLogoutEffect {

  @Effect() userLogout$: Observable<Action> = this.actions$
    .ofType(actionTypes.LOGOUT_USER)
    .pipe(
      mergeMap((action: actions.LogoutUserAction) => {
        this.store.dispatch(new actions.SetLayoutNeedSaveFalseAction());

        localStorage.setItem('redirect_url', '/profile');
        this.router.navigate(['soft']);

        if (this.auth.authenticated()) {
          return this.backendService.logoutUser({ empty: true })
            .pipe(
              map(body => new actions.LogoutUserSuccessAction(body.payload)),
              catchError(e => of(new actions.LogoutUserFailAction({ error: e })))
            );
        } else {
          return of({ type: 'EMPTY ACTION' });
        }
      }),
      tap(x => {
        localStorage.removeItem('token');
        this.cookieService.deleteCookie('token');
        this.store.dispatch(new actions.CloseWebSocketAction());
        this.store.dispatch(new actions.ResetStateAction());
        this.router.navigate(['logout']);
      })
    );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService,
    private router: Router,
    private store: Store<interfaces.AppState>,
    private auth: services.AuthService,
    private cookieService: services.CookieService
  ) {
  }

}
