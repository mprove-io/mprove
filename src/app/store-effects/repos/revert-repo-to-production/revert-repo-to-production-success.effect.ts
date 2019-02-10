import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as actionTypes from '@app/store-action-types/index';

@Injectable()
export class RevertRepoToProductionSuccessEffect {
  @Effect() revertRepoToProductionSuccess$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.REVERT_REPO_TO_PRODUCTION_SUCCESS),
    mergeMap((action: actions.RevertRepoToProductionSuccessAction) =>
      from([
        new actions.UpdateFilesStateAction([
          ...action.payload.deleted_dev_files,
          ...action.payload.changed_dev_files,
          ...action.payload.new_dev_files
        ]),
        new actions.ProcessStructsAction([action.payload.dev_struct])
      ])
    )
  );

  constructor(private actions$: Actions) {}
}
