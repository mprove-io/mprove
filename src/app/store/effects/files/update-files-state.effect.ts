import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import * as actions from '@app/store/actions/_index';
import * as api from '@app/api/_index';
import * as actionTypes from '@app/store/action-types';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import * as services from '@app/services/_index';

@Injectable()
export class UpdateFilesStateEffect {
  @Effect({ dispatch: false }) updateFilesState$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.UPDATE_FILES_STATE),
    tap((action: actions.UpdateFilesStateAction) => {
      let selectedFile: api.CatalogFile;
      this.store
        .select(selectors.getSelectedProjectModeRepoFile)
        .pipe(take(1))
        .subscribe(file => (selectedFile = file));

      if (selectedFile) {
        if (selectedFile.deleted) {
          this.printer.log(
            enums.busEnum.UPDATE_FILES_EFFECT,
            'selected file deleted'
          );

          // set needSave False
          this.printer.log(
            enums.busEnum.UPDATE_FILES_EFFECT,
            'setting needSave false...'
          );

          this.store
            .select(selectors.getLayoutNeedSave)
            .pipe(take(1))
            .subscribe(needSave => {
              if (needSave) {
                this.store.dispatch(new actions.SetLayoutNeedSaveFalseAction());
              }
            });

          // navigate blockml
          this.printer.log(
            enums.busEnum.UPDATE_FILES_EFFECT,
            'navigating blockml...'
          );

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
        }
      }
    })
  );

  constructor(
    private actions$: Actions,
    private printer: services.PrinterService,
    private router: Router,
    private store: Store<interfaces.AppState>
  ) {}
}
