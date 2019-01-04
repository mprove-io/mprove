import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { from, Observable } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as actionTypes from 'app/store/action-types';
import * as enums from 'app/enums/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';

@Injectable()
export class DeleteFolderSuccessEffect {
  @Effect() deleteFolderSuccess$: Observable<Action> = this.actions$.pipe(
    ofType(actionTypes.DELETE_FOLDER_SUCCESS),
    mergeMap((action: actions.DeleteFolderSuccessAction) => {
      let selectedProjectId: string;
      this.store
        .select(selectors.getLayoutProjectId)
        .pipe(take(1))
        .subscribe(id => (selectedProjectId = id));

      let selectedMode: enums.LayoutModeEnum;
      this.store
        .select(selectors.getLayoutMode)
        .pipe(take(1))
        .subscribe(x => (selectedMode = x));

      this.router.navigate([
        '/project',
        selectedProjectId,
        'mode',
        selectedMode,
        'blockml'
      ]);

      return from([
        new actions.UpdateFilesStateAction(
          action.payload.deleted_folder_dev_files
        ),
        new actions.ProcessStructsAction([action.payload.dev_struct])
      ]);
    })
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private store: Store<interfaces.AppState>
  ) {}
}
