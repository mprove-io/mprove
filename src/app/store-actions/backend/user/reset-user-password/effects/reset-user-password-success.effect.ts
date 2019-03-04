import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as interfaces from '@app/interfaces/_index';
import * as actionTypes from '@app/store-actions/action-types';
import { Router } from '@angular/router';

@Injectable()
export class ResetUserPasswordSuccessEffect {
  @Effect({ dispatch: false }) resetUserPasswordSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.RESET_USER_PASSWORD_SUCCESS),
    tap((action: actions.ResetUserPasswordSuccessAction) => {
      this.store.dispatch(
        new actions.UpdateLayoutEmailToResetPasswordAction(
          action.payload.user_id
        )
      );
      this.router.navigate(['reset-password-sent']);
    })
  );

  constructor(
    private actions$: Actions,
    private store: Store<interfaces.AppState>,
    private router: Router
  ) {}
}
