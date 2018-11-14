import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as services from 'app/services/_index';

@Injectable()
export class RegenerateRepoRemotePublicKeyEffect {
  @Effect() regenerateRepoRemotePublicKey$: Observable<
    Action
  > = this.actions$.ofType(actionTypes.REGENERATE_REPO_REMOTE_PUBLIC_KEY).pipe(
    mergeMap((action: actions.RegenerateRepoRemotePublicKeyAction) =>
      this.backendService.regenerateRepoRemotePublicKey(action.payload).pipe(
        map(
          body =>
            new actions.RegenerateRepoRemotePublicKeySuccessAction(body.payload)
        ),
        catchError(e =>
          of(new actions.RegenerateRepoRemotePublicKeyFailAction({ error: e }))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
