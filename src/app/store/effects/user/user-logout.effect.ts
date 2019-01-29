import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as interfaces from 'app/interfaces/_index';
import * as services from 'app/services/_index';
import * as constants from 'app/constants/_index';

@Injectable()
export class UserLogoutEffect {
  @Effect() userLogout$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.LOGOUT_USER),
    mergeMap((action: actions.LogoutUserAction) => {
      this.store.dispatch(new actions.SetLayoutNeedSaveFalseAction());

      this.watchAuthenticationService.stop();

      localStorage.removeItem('token');
      this.cookieService.deleteCookie('token'); // TODO: cookie token

      this.router.navigate([constants.PATH_LOGIN]);
      this.store.dispatch(new actions.ResetStateAction());
      this.store.dispatch(new actions.CloseWebSocketAction());

      if (this.auth.authenticated()) {
        return this.backendService.logoutUser({ empty: true }).pipe(
          map(body => new actions.LogoutUserSuccessAction(body.payload)),
          catchError(e => of(new actions.LogoutUserFailAction({ error: e })))
        );
      } else {
        return of({ type: 'EMPTY ACTION' });
      }
    })
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService,
    private router: Router,
    private store: Store<interfaces.AppState>,
    private auth: services.AuthService,
    private watchAuthenticationService: services.WatchAuthenticationService,
    private cookieService: services.CookieService
  ) {}
}
