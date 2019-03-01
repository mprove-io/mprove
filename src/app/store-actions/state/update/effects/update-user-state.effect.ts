import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store-actions/action-types';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import * as services from '@app/services/_index';
import * as constants from '@app/constants/_index';

@Injectable()
export class UpdateUserStateEffect {
  @Effect({ dispatch: false }) updateUserState$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.UPDATE_USER_STATE),
    tap((action: actions.UpdateUserStateAction) => {
      let user: api.User;

      this.store
        .select(selectors.getUserState)
        .pipe(take(1))
        .subscribe(x => (user = x));

      if (user && user.deleted) {
        this.store.dispatch(new actions.SetLayoutNeedSaveFalseAction());

        this.watchAuthenticationService.stop();

        localStorage.removeItem('token');

        this.router.navigate([constants.PATH_LOGIN]);
        this.store.dispatch(new actions.ResetStateAction());
        this.store.dispatch(new actions.CloseWebSocketAction());
      }
    })
  );

  constructor(
    private actions$: Actions,
    private myDialogService: services.MyDialogService,
    private printer: services.PrinterService,
    private watchAuthenticationService: services.WatchAuthenticationService,
    private router: Router,
    private store: Store<interfaces.AppState>
  ) {}
}
