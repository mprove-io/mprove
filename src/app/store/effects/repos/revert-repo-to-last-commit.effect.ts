import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as services from 'app/services/_index';

@Injectable()
export class RevertRepoToLastCommitEffect {
  @Effect() revertRepoToLastCommit$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.REVERT_REPO_TO_LAST_COMMIT),
    mergeMap((action: actions.RevertRepoToLastCommitAction) =>
      this.backendService.revertRepoToLastCommit(action.payload).pipe(
        map(
          body => new actions.RevertRepoToLastCommitSuccessAction(body.payload)
        ),
        catchError(e =>
          of(new actions.RevertRepoToLastCommitFailAction({ error: e }))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
