import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';
import * as services from '@app/services/_index';

@Injectable()
export class PongEffect {
  @Effect() pong$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.PONG),
    mergeMap((action: actions.PongAction) =>
      this.backendService.pong(action.payload).pipe(
        map(body => new actions.PongSuccessAction()),
        catchError(e => of(new actions.PongFailAction({ error: e })))
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
