import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';
import * as services from '@app/services/_index';

@Injectable()
export class DuplicateMconfigAndQueryEffect {
  @Effect() duplicateMconfigAndQuery$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.DUPLICATE_MCONFIG_AND_QUERY),
    mergeMap((action: actions.DuplicateMconfigAndQueryAction) =>
      this.backendService.duplicateMconfigAndQuery(action.payload).pipe(
        map(
          body =>
            new actions.DuplicateMconfigAndQuerySuccessAction(body.payload)
        ),
        catchError(e =>
          of(new actions.DuplicateMconfigAndQueryFailAction({ error: e }))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService,
    private structService: services.StructService
  ) {}
}
