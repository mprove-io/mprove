import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';
import * as services from '@app/services/_index';

@Injectable()
export class CreateMconfigAndQueryEffect {
  @Effect() createMconfigAndQuery$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.CREATE_MCONFIG_AND_QUERY),
    filter(
      (action: actions.CreateMconfigAndQueryAction) =>
        !this.structService.mconfigHasFiltersWithDuplicateFractions(
          action.payload.mconfig
        )
    ),
    mergeMap((action: actions.CreateMconfigAndQueryAction) =>
      this.backendService.createMconfigAndQuery(action.payload).pipe(
        map(
          body => new actions.CreateMconfigAndQuerySuccessAction(body.payload)
        ),
        catchError(e =>
          of(new actions.CreateMconfigAndQueryFailAction({ error: e }))
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
