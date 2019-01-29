import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, map, mergeMap, switchMap, take, tap } from 'rxjs/operators';
import * as actions from '@app/store/actions/_index';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import * as services from '@app/services/_index';

@Injectable()
export class ModelResolver implements Resolve<boolean> {
  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>,
    private myDialogService: services.MyDialogService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    this.printer.log(enums.busEnum.MODEL_SELECTED_RESOLVER, 'starts...');

    // this.store.select(selectors.getLayoutChartId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutChartIdAction(undefined)) : 0);
    //
    // this.store.select(selectors.getLayoutQueryId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutQueryIdAction(undefined)) : 0);
    //
    // this.store.select(selectors.getLayoutMconfigId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutMconfigIdAction(undefined)) : 0);

    this.printer.log(
      enums.busEnum.MODEL_SELECTED_RESOLVER,
      'modelId:',
      route.params['modelId']
    );

    let bqProject: string;
    this.store
      .select(selectors.getSelectedProjectBqProject)
      .pipe(take(1))
      .subscribe(x => (bqProject = x));

    if (!bqProject) {
      this.printer.log(
        enums.busEnum.MODEL_SELECTED_RESOLVER,
        `bqProject empty, navigating profile...`
      );
      this.router.navigate(['/profile']);

      this.myDialogService.showBqDialog();
      this.printer.log(
        enums.busEnum.MODEL_SELECTED_RESOLVER,
        `resolved (false)`
      );
      return of(false);
    }

    let selectedProjectModeRepoId: string;
    this.store
      .select(selectors.getSelectedProjectModeRepoId)
      .pipe(take(1))
      .subscribe(x => (selectedProjectModeRepoId = x));

    if (!selectedProjectModeRepoId) {
      this.printer.log(
        enums.busEnum.MODEL_SELECTED_RESOLVER,
        `selectedProjectModeRepoId undefined`
      );
      this.printer.log(
        enums.busEnum.MODEL_SELECTED_RESOLVER,
        `resolved (false)`
      );
      return of(false);
    }

    return this.store.select(selectors.getUserLoaded).pipe(
      filter(loaded => loaded),
      take(1),
      switchMap(() => this.hasModelInStore(route.params['modelId']))
    );
  }

  /**
   * This method checks if a model with the given modelId is already registered
   * in the Store and is not Deleted
   */
  hasModelInStore(id: string): Observable<boolean> {
    return this.store.select(selectors.getModelsState).pipe(
      mergeMap(models => {
        let selectedProjectId: string;
        this.store
          .select(selectors.getSelectedProjectId)
          .pipe(take(1))
          .subscribe(x => (selectedProjectId = x));

        let selectedProjectModeRepoId: string;
        this.store
          .select(selectors.getSelectedProjectModeRepoId)
          .pipe(take(1))
          .subscribe(x => (selectedProjectModeRepoId = x));

        let selectedProjectModeRepoStructId: string;
        this.store
          .select(selectors.getSelectedProjectModeRepoStructId)
          .pipe(take(1))
          .subscribe(x => (selectedProjectModeRepoStructId = x));

        let exists =
          models.findIndex(
            model =>
              model.project_id === selectedProjectId &&
              model.repo_id === selectedProjectModeRepoId &&
              model.model_id === id &&
              model.struct_id === selectedProjectModeRepoStructId
          ) > -1;

        if (!exists) {
          this.printer.log(
            enums.busEnum.MODEL_SELECTED_RESOLVER,
            `model not exists, navigating 404...`
          );

          this.store
            .select(selectors.getLayoutModelId)
            .pipe(take(1))
            .subscribe(x =>
              x
                ? this.store.dispatch(
                    new actions.UpdateLayoutModelIdAction(undefined)
                  )
                : 0
            );

          this.router.navigate(['/404']);
          this.printer.log(
            enums.busEnum.MODEL_SELECTED_RESOLVER,
            `resolved (false)`
          );
          return of(false);
        } else {
          this.printer.log(
            enums.busEnum.MODEL_SELECTED_RESOLVER,
            `model exists`
          );

          let layoutModelId: string;
          this.store
            .select(selectors.getLayoutModelId)
            .pipe(take(1))
            .subscribe(modelId => (layoutModelId = modelId));

          if (id !== layoutModelId) {
            this.printer.log(
              enums.busEnum.MODEL_SELECTED_RESOLVER,
              `selecting model...`
            );
            this.store.dispatch(new actions.UpdateLayoutModelIdAction(id));

            return this.store.select(selectors.getLayoutModelId).pipe(
              filter(selectedModelId => selectedModelId === id),
              map(() => true),
              tap(x => {
                this.printer.log(
                  enums.busEnum.MODEL_SELECTED_RESOLVER,
                  `model selected`
                );
                this.printer.log(
                  enums.busEnum.MODEL_SELECTED_RESOLVER,
                  `resolved (true)`
                );
              }),
              take(1)
            );
          } else {
            this.printer.log(
              enums.busEnum.MODEL_SELECTED_RESOLVER,
              `model already selected`
            );
            this.printer.log(
              enums.busEnum.MODEL_SELECTED_RESOLVER,
              `resolved (true)`
            );
            return of(true);
          }
        }
      }),
      take(1)
    );
  }
}
