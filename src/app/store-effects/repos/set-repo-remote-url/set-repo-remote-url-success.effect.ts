import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as actionTypes from '@app/store-action-types/index';

@Injectable()
export class SetRepoRemoteUrlSuccessEffect {
  @Effect() setRepoRemoteUrlSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.SET_REPO_REMOTE_URL_SUCCESS),
    mergeMap((action: actions.SetRepoRemoteUrlSuccessAction) =>
      from([new actions.UpdateReposStateAction([action.payload.dev_repo])])
    )
  );

  constructor(private actions$: Actions) {}
}
