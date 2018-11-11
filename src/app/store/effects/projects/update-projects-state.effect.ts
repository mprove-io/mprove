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
import * as constants from 'app/constants/_index';

@Injectable()
export class UpdateProjectsStateEffect {

  @Effect({ dispatch: false }) updateProjectsState$: Observable<Action> = this.actions$
    .ofType(actionTypes.UPDATE_PROJECTS_STATE)
    .pipe(
      tap((action: actions.UpdateProjectsStateAction) => {

        let selectedProject: api.Project;
        this.store.select(selectors.getSelectedProject)
          .pipe(take(1))
          .subscribe(project => selectedProject = project);

        if (selectedProject && selectedProject.deleted) {
          this.printer.log(enums.busEnum.UPDATE_PROJECTS_EFFECT, 'selected project deleted');

          // set needSave False
          this.printer.log(enums.busEnum.UPDATE_PROJECTS_EFFECT, 'setting needSave false...');

          this.store.select(selectors.getLayoutNeedSave)
            .pipe(take(1))
            .subscribe(needSave => {
              if (needSave) {
                this.store.dispatch(new actions.SetLayoutNeedSaveFalseAction());
              }
            }
            );

          // navigate profile
          this.printer.log(enums.busEnum.UPDATE_PROJECTS_EFFECT, 'navigating profile...');

          this.router.navigate(['profile']);

          // set prod mode
          this.printer.log(enums.busEnum.UPDATE_PROJECTS_EFFECT, 'setting prod mode...');

          let mode: enums.LayoutModeEnum;
          this.store.select(selectors.getLayoutMode)
            .pipe(take(1))
            .subscribe(x => mode = x);

          if (mode === enums.LayoutModeEnum.Dev) {
            this.store.dispatch(new actions.SetLayoutModeProdAction());
          }

          // select Demo project
          this.printer.log(enums.busEnum.UPDATE_PROJECTS_EFFECT, 'selecting Demo project...');
          this.store.dispatch(new actions.UpdateLayoutProjectIdAction(constants.DEMO));
        }
      })
    );

  constructor(
    private actions$: Actions,
    private printer: services.PrinterService,
    private router: Router,
    private store: Store<interfaces.AppState>) {
  }

}
