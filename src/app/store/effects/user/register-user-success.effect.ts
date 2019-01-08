import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as services from 'app/services/_index';

@Injectable()
export class RegisterUserSuccessEffect {
  @Effect({ dispatch: false }) registerUserSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.REGISTER_USER_SUCCESS),
    tap((action: actions.RegisterUserSuccessAction) => {
      localStorage.setItem('token', action.payload.token);
    })
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
