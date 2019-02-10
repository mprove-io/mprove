import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as actionTypes from '@app/store-action-types/index';
import * as services from '@app/services/_index';

@Injectable()
export class CancelQueriesEffects {
  @Effect() cancelQueries$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.CANCEL_QUERIES),
    mergeMap((action: actions.CancelQueriesAction) =>
      this.backendService.cancelQueries(action.payload).pipe(
        map(body => new actions.CancelQueriesSuccessAction(body.payload)),
        catchError(e => of(new actions.CancelQueriesFailAction({ error: e })))
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
