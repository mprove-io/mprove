import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as services from 'app/services/_index';

@Injectable()
export class RegenerateRepoRemoteWebhookEffect {
  @Effect() regenerateRepoRemoteWebhook$: Observable<
    Action
  > = this.actions$.ofType(actionTypes.REGENERATE_REPO_REMOTE_WEBHOOK).pipe(
    mergeMap((action: actions.RegenerateRepoRemoteWebhookAction) =>
      this.backendService.regenerateRepoRemoteWebhook(action.payload).pipe(
        map(
          body =>
            new actions.RegenerateRepoRemoteWebhookSuccessAction(body.payload)
        ),
        catchError(e =>
          of(new actions.RegenerateRepoRemoteWebhookFailAction({ error: e }))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private backendService: services.BackendService
  ) {}
}
