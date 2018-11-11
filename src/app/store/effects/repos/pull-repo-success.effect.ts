import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';

@Injectable()
export class PullRepoSuccessEffect {

  @Effect() pullRepoSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.PULL_REPO_SUCCESS)
    .pipe(
      mergeMap((action: actions.PullRepoSuccessAction) => from([
        new actions.UpdateFilesStateAction([
          ...action.payload.deleted_dev_files,
          ...action.payload.changed_dev_files,
          ...action.payload.new_dev_files,
        ]),
        new actions.ProcessStructsAction(action.payload.dev_struct_or_empty),
      ])
      )
    );

  constructor(
    private actions$: Actions) {
  }
}
