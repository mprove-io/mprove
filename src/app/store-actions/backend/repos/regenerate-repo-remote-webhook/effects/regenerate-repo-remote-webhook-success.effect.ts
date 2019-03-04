import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as actionTypes from '@app/store-actions/action-types';

@Injectable()
export class RegenerateRepoRemoteWebhookSuccessEffect {
  @Effect() regenerateRepoRemoteWebhookSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.REGENERATE_REPO_REMOTE_WEBHOOK_SUCCESS),
    mergeMap((action: actions.RegenerateRepoRemoteWebhookSuccessAction) =>
      from([new actions.UpdateReposStateAction([action.payload.dev_repo])])
    )
  );

  constructor(private actions$: Actions) {}
}
