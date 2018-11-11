import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';

@Injectable()
export class PushRepoSuccessEffect {

  @Effect() pushRepoSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.PUSH_REPO_SUCCESS).pipe(
      mergeMap((action: actions.PushRepoSuccessAction) =>
        from([
          new actions.UpdateFilesStateAction([
            ...action.payload.deleted_prod_files,
            ...action.payload.changed_prod_files,
            ...action.payload.new_prod_files,
          ]),
          new actions.ProcessStructsAction([action.payload.prod_struct]),
          new actions.UpdateReposStateAction([action.payload.dev_repo]),
        ])
      )
    );

  constructor(
    private actions$: Actions) {
  }
}
