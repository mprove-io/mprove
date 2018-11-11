import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as services from 'app/services/_index';

@Injectable()
export class RevertRepoToProductionEffect {

  @Effect() revertRepoToProduction$: Observable<Action> = this.actions$
    .ofType(actionTypes.REVERT_REPO_TO_PRODUCTION)
    .pipe(
      mergeMap((action: actions.RevertRepoToProductionAction) =>
        this.backendService.revertRepoToProduction(action.payload)
          .pipe(
            map(body => new actions.RevertRepoToProductionSuccessAction(body.payload)),
            catchError(e => of(new actions.RevertRepoToProductionFailAction({ error: e })))
          )
      )
    );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService) {
  }
}
