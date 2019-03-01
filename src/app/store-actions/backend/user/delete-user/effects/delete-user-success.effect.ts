import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as interfaces from '@app/interfaces/_index';
import * as services from '@app/services/_index';
import * as constants from '@app/constants/_index';
import * as actionTypes from '@app/store-actions/action-types';
import { Router } from '@angular/router';

@Injectable()
export class DeleteUserSuccessEffect {
  @Effect({ dispatch: false }) deleteUserSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.DELETE_USER_SUCCESS),
    tap((action: actions.DeleteUserSuccessAction) => {
      this.store.dispatch(new actions.SetLayoutNeedSaveFalseAction());

      this.watchAuthenticationService.stop();

      localStorage.removeItem('token');

      this.router.navigate([constants.PATH_LOGIN]);
      this.store.dispatch(new actions.ResetStateAction());
      this.store.dispatch(new actions.CloseWebSocketAction());
    })
  );

  constructor(
    private actions$: Actions,
    private store: Store<interfaces.AppState>,
    private router: Router,
    private watchAuthenticationService: services.WatchAuthenticationService
  ) {}
}
