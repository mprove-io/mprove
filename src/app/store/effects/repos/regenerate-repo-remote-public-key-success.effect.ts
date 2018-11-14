import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';

@Injectable()
export class RegenerateRepoRemotePublicKeySuccessEffect {
  @Effect() regenerateRepoRemotePublicKeySuccess$: Observable<
    Action
  > = this.actions$
    .ofType(actionTypes.REGENERATE_REPO_REMOTE_PUBLIC_KEY_SUCCESS)
    .pipe(
      mergeMap((action: actions.RegenerateRepoRemotePublicKeySuccessAction) =>
        from([new actions.UpdateReposStateAction([action.payload.dev_repo])])
      )
    );

  constructor(private actions$: Actions) {}
}
