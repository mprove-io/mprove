import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';
import * as services from 'src/app/services/_index';

@Injectable()
export class PullRepoEffect {

  @Effect() pullRepo$: Observable<Action> = this.actions$
    .ofType(actionTypes.PULL_REPO).pipe(
      mergeMap((action: actions.PullRepoAction) => this.backendService.pullRepo(action.payload)
        .pipe(
          map(body => new actions.PullRepoSuccessAction(body.payload)),
          catchError(e => of(new actions.PullRepoFailAction({ error: e })))
        )
      )
    );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService) {
  }
}
