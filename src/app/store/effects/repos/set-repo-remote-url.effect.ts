import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as services from 'app/services/_index';

@Injectable()
export class SetRepoRemoteUrlEffect {
  @Effect() setRepoRemoteUrl$: Observable<Action> = this.actions$
    .ofType(actionTypes.SET_REPO_REMOTE_URL)
    .pipe(
      mergeMap((action: actions.SetRepoRemoteUrlAction) =>
        this.backendService.setRepoRemoteUrl(action.payload).pipe(
          map(body => new actions.SetRepoRemoteUrlSuccessAction(body.payload)),
          catchError(e =>
            of(new actions.SetRepoRemoteUrlFailAction({ error: e }))
          )
        )
      )
    );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
