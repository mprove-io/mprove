import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as services from 'app/services/_index';

@Injectable()
export class CommitRepoEffect {
  @Effect() commitRepo$: Observable<Action> = this.actions$
    .ofType(actionTypes.COMMIT_REPO)
    .pipe(
      mergeMap((action: actions.CommitRepoAction) =>
        this.backendService.commitRepo(action.payload).pipe(
          map(body => new actions.CommitRepoSuccessAction(body.payload)),
          catchError(e => of(new actions.CommitRepoFailAction({ error: e })))
        )
      )
    );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
