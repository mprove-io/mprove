import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';
import * as services from 'src/app/services/_index';

@Injectable()
export class CreateMconfigAndQueryEffect {

  @Effect() createMconfigAndQuery$: Observable<Action> = this.actions$
    .ofType(actionTypes.CREATE_MCONFIG_AND_QUERY)
    .pipe(
      filter((action: actions.CreateMconfigAndQueryAction) =>
        !this.structService.mconfigHasFiltersWithDuplicateFractions(action.payload.mconfig)),
      mergeMap((action: actions.CreateMconfigAndQueryAction) =>
        this.backendService.createMconfigAndQuery(action.payload)
          .pipe(
            map(body => new actions.CreateMconfigAndQuerySuccessAction(body.payload)),
            catchError(e => of(new actions.CreateMconfigAndQueryFailAction({ error: e })))
          )
      )
    );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService,
    private structService: services.StructService) {
  }
}
