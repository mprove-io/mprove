import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as actionTypes from 'src/app/store/action-types';
import * as enums from 'src/app/enums/_index';
import * as interfaces from 'src/app/interfaces/_index';
import * as selectors from 'src/app/store/selectors/_index';

@Injectable()
export class RenameFolderSuccessEffect {

  @Effect() renameFolderSuccess$: Observable<Action> = this.actions$
    .ofType(actionTypes.RENAME_FOLDER_SUCCESS)
    .pipe(
      mergeMap((action: actions.RenameFolderSuccessAction) => {

        let selectedProjectId: string;
        this.store.select(selectors.getLayoutProjectId)
          .pipe(take(1))
          .subscribe(id => selectedProjectId = id);

        let selectedMode: enums.LayoutModeEnum;
        this.store.select(selectors.getLayoutMode)
          .pipe(take(1))
          .subscribe(x => selectedMode = x);

        this.router.navigate(['/project', selectedProjectId, 'mode', selectedMode, 'blockml']);

        return from([
          new actions.UpdateFilesStateAction([
            ...action.payload.deleted_folder_dev_files,
            ...action.payload.new_folder_dev_files,
          ]),
          new actions.ProcessStructsAction([action.payload.dev_struct]),
        ]);
      })
    );

  constructor(
    private actions$: Actions,
    private router: Router,
    private store: Store<interfaces.AppState>) {
  }

}
