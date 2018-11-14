import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as actionTypes from 'app/store/action-types';
import * as enums from 'app/enums/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import * as services from 'app/services/_index';

@Injectable()
export class UpdateReposStateEffect {
  @Effect({ dispatch: false }) updateReposState$: Observable<
    Action
  > = this.actions$.ofType(actionTypes.UPDATE_REPOS_STATE).pipe(
    tap((action: actions.UpdateReposStateAction) => {
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

      let selectedDashboard: api.Dashboard;
      this.store
        .select(selectors.getSelectedProjectModeRepoDashboard)
        .pipe(take(1))
        .subscribe(x => (selectedDashboard = x));

      if (selectedRepo) {
        // if (selectedRepo.deleted) {
        //   this.printer.log(enums.busEnum.UPDATE_REPOS_EFFECT, 'selected repo deleted');

        //   // set needSave False
        //   this.printer.log(enums.busEnum.UPDATE_REPOS_EFFECT, 'setting needSave false...');

        //   this.store.select(selectors.getLayoutNeedSave).take(1).subscribe(
        //     needSave => {
        //       if (needSave) {
        //         this.store.dispatch(new SetLayoutNeedSaveFalseAction());
        //       }
        //     }
        //   );

        //   // navigate profile
        //   this.printer.log(enums.busEnum.UPDATE_REPOS_EFFECT, 'navigating profile...');
        //   this.router.navigate(['profile']);

        //   // set prod mode
        //   this.printer.log(enums.busEnum.UPDATE_REPOS_EFFECT, 'setting prod mode...');

        //   let mode: LayoutModeEnum;
        //   this.store.select(selectors.getLayoutMode).take(1).subscribe(x => mode = x);

        //   if (mode === LayoutModeEnum.Dev) {
        //     this.store.dispatch(new SetLayoutModeProdAction());
        //   }

        // }

        // repo updated before model
        if (
          selectedModel &&
          selectedModel.struct_id !== selectedRepo.struct_id
        ) {
          this.printer.log(
            enums.busEnum.UPDATE_REPOS_EFFECT,
            'selected model struct_id mismatch'
          );

          // navigate profile
          this.printer.log(
            enums.busEnum.UPDATE_REPOS_EFFECT,
            'navigating profile...'
          );

          this.router.navigate(['profile']);

          // repo updated before dashboard
        } else if (
          selectedDashboard &&
          selectedDashboard.struct_id !== selectedRepo.struct_id
        ) {
          this.printer.log(
            enums.busEnum.UPDATE_REPOS_EFFECT,
            'selected dashboard struct_id mismatch'
          );

          // navigate profile
          this.printer.log(
            enums.busEnum.UPDATE_REPOS_EFFECT,
            'navigating profile...'
          );

          this.router.navigate(['profile']);

          // this.printer.log(enums.busEnum.UPDATE_REPOS_EFFECT, 'selected dashboard struct_id mismatch');

          // if (selectedDashboard.temp) {
          //   this.printer.log(enums.busEnum.UPDATE_REPOS_EFFECT, 'selected dashboard is temp');
          //   this.printer.log(enums.busEnum.UPDATE_REPOS_EFFECT, 'navigating profile...');

          //   this.router.navigate(['profile']);

          // } else {
          //   this.printer.log(enums.busEnum.UPDATE_REPOS_EFFECT, 'selected dashboard is not temp');
          //   this.printer.log(enums.busEnum.UPDATE_REPOS_EFFECT, 'renavigating using load...');

          //   let url = this.router.routerState.snapshot.url;
          //   console.log('url:', url);
          //   localStorage.setItem('redirect_url', url);
          //   this.router.navigate(['load']);
          // }
        }
      }

      action.payload.forEach(repo => {
        let clean = {
          project_id: repo.project_id,
          repo_id: repo.repo_id,
          struct_id: repo.struct_id
        };

        this.store.dispatch(new actions.CleanQueriesStateAction(clean));
        this.store.dispatch(new actions.CleanMconfigsStateAction(clean));
        this.store.dispatch(new actions.CleanModelsStateAction(clean));
        this.store.dispatch(new actions.CleanDashboardsStateAction(clean));
        this.store.dispatch(new actions.CleanErrorsStateAction(clean));
      });
    })
  );

  constructor(
    private actions$: Actions,
    private router: Router,
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>
  ) {}
}
