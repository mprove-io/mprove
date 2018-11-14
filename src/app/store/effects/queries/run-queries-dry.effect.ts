import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as services from 'app/services/_index';

@Injectable()
export class RunQueriesDryEffect {
  @Effect() runQueriesDry$: Observable<Action> = this.actions$
    .ofType(actionTypes.RUN_QUERIES_DRY)
    .pipe(
      mergeMap((action: actions.RunQueriesDryAction) =>
        this.backendService.runQueriesDry(action.payload).pipe(
          map(body => new actions.RunQueriesDrySuccessAction(body.payload)),
          catchError(e => of(new actions.RunQueriesDryFailAction({ error: e })))
        )
      )
    );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
