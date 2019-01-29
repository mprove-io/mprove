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
export class UpdateModelsStateEffect {
  @Effect({ dispatch: false }) updateModelsState$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(actionTypes.UPDATE_MODELS_STATE),
    tap((action: actions.UpdateModelsStateAction) => {
      let selectedRepo: api.Repo;
      this.store
        .select(selectors.getSelectedProjectModeRepo)
        .pipe(take(1))
        .subscribe(x => (selectedRepo = x));

      let selectedModel: api.Model;
      this.store
        .select(selectors.getSelectedProjectModeRepoModel)
        .pipe(take(1))
        .subscribe(model => (selectedModel = model));

      if (selectedModel) {
        // model updated before repo
        if (selectedModel.struct_id !== selectedRepo.struct_id) {
          this.printer.log(
            enums.busEnum.UPDATE_MODELS_EFFECT,
            'selected model struct_id mismatch'
          );

          // navigate profile
          this.printer.log(
            enums.busEnum.UPDATE_MODELS_EFFECT,
            'navigating profile...'
          );
          this.router.navigate(['profile']);
        }
      }
    })
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>
  ) {}
}
