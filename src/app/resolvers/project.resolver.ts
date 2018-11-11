import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, map, mergeMap, switchMap, take, tap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as constants from 'src/app/constants/_index';
import * as enums from 'src/app/enums/_index';
import * as interfaces from 'src/app/interfaces/_index';
import * as selectors from 'src/app/store/selectors/_index';
import * as services from 'src/app/services/_index';

@Injectable()
export class ProjectResolver implements Resolve<boolean> {

  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>,
    private router: Router) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    this.printer.log(enums.busEnum.PROJECT_SELECTED_RESOLVER, 'starts...');

    // this.store.select(selectors.getLayoutChartId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutChartIdAction(undefined)) : 0);
    //
    // this.store.select(selectors.getLayoutQueryId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutQueryIdAction(undefined)) : 0);
    //
    // this.store.select(selectors.getLayoutMconfigId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutMconfigIdAction(undefined)) : 0);
    //
    // this.store.select(selectors.getLayoutModelId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutModelIdAction(undefined)) : 0);


    // this.store.select(selectors.getLayoutDashboardId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutDashboardIdAction(undefined)) : 0);


    // this.store.select(selectors.getLayoutNeedSave).take(1).subscribe(
    //   x => x ? this.store.dispatch(new SetLayoutNeedSaveFalseAction()) : 0);
    //
    // this.store.select(selectors.getLayoutLineNumber).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutLineNumberAction(undefined)) : 0);
    //
    // this.store.select(selectors.getLayoutFileId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutFileIdAction(undefined)) : 0);


    // this.store.select(selectors.getLayoutModeIsDev).take(1).subscribe(
    //   x => x ? this.store.dispatch(new SetLayoutModeProdAction()) : 0);

    this.printer.log(enums.busEnum.PROJECT_SELECTED_RESOLVER, 'projectId:', route.params['projectId']);

    return this.store.select(selectors.getUserLoaded)
      .pipe(
        filter(loaded => loaded),
        take(1),
        switchMap(() => this.hasProjectInStore(route.params['projectId']))
      );
  }

  /**
   * This method checks if a project with the given projectId is already registered
   * in the Store and is not Deleted
   */
  hasProjectInStore(id: string): Observable<boolean> {
    return this.store.select(selectors.getProjectsState)
      .pipe(
        mergeMap(projects => {

          let exists = projects.findIndex(project => project.project_id === id && project.deleted === false) > -1;

          if (!exists) {
            this.printer.log(enums.busEnum.PROJECT_SELECTED_RESOLVER, `project not exists, navigating 404...`);
            this.store.dispatch(new actions.UpdateLayoutProjectIdAction(constants.DEMO));
            this.router.navigate(['/404']);
            this.printer.log(enums.busEnum.PROJECT_SELECTED_RESOLVER, `resolved (false)`);
            return of(false);

          } else {
            this.printer.log(enums.busEnum.PROJECT_SELECTED_RESOLVER, `project exists`);

            let layoutProjectId: string;
            this.store.select(selectors.getLayoutProjectId)
              .pipe(take(1))
              .subscribe(projectId => layoutProjectId = projectId);

            if (id !== layoutProjectId) {
              this.printer.log(enums.busEnum.PROJECT_SELECTED_RESOLVER, `selecting project...`);

              this.store.dispatch(new actions.UpdateLayoutProjectIdAction(id));

              return this.store.select(selectors.getSelectedProjectId).pipe(
                filter(selectedProjectId => selectedProjectId === id),
                map(() => true),
                tap(x => {
                  this.printer.log(enums.busEnum.PROJECT_SELECTED_RESOLVER, `project selected`);
                  this.printer.log(enums.busEnum.PROJECT_SELECTED_RESOLVER, `resolved (true)`);
                }),
                take(1)
              );

            } else {

              this.printer.log(enums.busEnum.PROJECT_SELECTED_RESOLVER, `project already selected`);
              this.printer.log(enums.busEnum.PROJECT_SELECTED_RESOLVER, `resolved (true)`);
              return of(true);
            }
          }
        }),
        take(1)
      );
  }
}
