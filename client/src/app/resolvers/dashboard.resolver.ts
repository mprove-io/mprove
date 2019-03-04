import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import { BackendService } from '@app/services/backend.service';
import { LiveQueriesService } from '@app/services/live-queries.service';
import { MyDialogService } from '@app/services/my-dialog.service';
import { PrinterService } from '@app/services/printer.service';

@Injectable()
export class DashboardResolver
  implements Resolve<boolean | Observable<boolean>> {
  constructor(
    private printer: PrinterService,
    private store: Store<interfaces.AppState>,
    private liveQueriesService: LiveQueriesService,
    private myDialogService: MyDialogService,
    private backendService: BackendService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | Observable<boolean>> {
    this.printer.log(enums.busEnum.DASHBOARD_SELECTED_RESOLVER, 'starts...');

    this.printer.log(
      enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
      'dashboardId:',
      route.params['dashboardId']
    );

    let bqProject: string;
    this.store
      .select(selectors.getSelectedProjectBqProject)
      .pipe(take(1))
      .subscribe(x => (bqProject = x));

    if (!bqProject) {
      this.printer.log(
        enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
        `bqProject empty, navigating profile...`
      );
      this.router.navigate(['/profile']);

      this.myDialogService.showBqDialog();
      this.printer.log(
        enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
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
        enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
        `selectedProjectModeRepoId undefined`
      );
      this.printer.log(
        enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
        `resolved (false)`
      );
      return of(false);
    }

    return this.store.select(selectors.getUserLoaded).pipe(
      filter(loaded => loaded),
      take(1),
      switchMap(() => {
        this.printer.log(
          enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
          `getting from API...`
        );

        let projectId: string;
        this.store
          .select(selectors.getLayoutProjectId)
          .pipe(take(1))
          .subscribe(x => (projectId = x));

        let repoId: string;
        this.store
          .select(selectors.getSelectedProjectModeRepoId)
          .pipe(take(1))
          .subscribe(x => (repoId = x));

        return this.hasDashboardInApi(
          projectId,
          repoId,
          route.params['dashboardId']
        );
      })
    );
  }

  /**
   * This method loads a dashboard with the given ID from the API and caches
   * it in the store, returning `true` or `false` if it was found.
   */
  hasDashboardInApi(
    projectId: string,
    repoId: string,
    id: string
  ): Observable<boolean | Observable<boolean>> {
    return this.backendService
      .getDashboardMconfigsQueries({
        project_id: projectId,
        repo_id: repoId,
        dashboard_id: id
      })
      .pipe(
        map(body => {
          if (body.payload.dashboard_or_empty.length > 0) {
            const {
              dashboard_queries,
              dashboard_mconfigs,
              dashboard_or_empty
            } = body.payload;

            this.liveQueriesService.setLiveQueries(
              dashboard_queries.map(q => q.query_id)
            );

            this.store.dispatch(
              new actions.UpdateQueriesStateAction(dashboard_queries)
            );
            this.store.dispatch(
              new actions.UpdateMconfigsStateAction(dashboard_mconfigs)
            );
            this.store.dispatch(
              new actions.UpdateDashboardsStateAction(dashboard_or_empty)
            );

            this.printer.log(
              enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
              `dashboard loaded from API`
            );
            return this.selectDashboardId(id);
          } else {
            this.store
              .select(selectors.getLayoutDashboardId)
              .pipe(take(1))
              .subscribe(x =>
                x
                  ? this.store.dispatch(
                      new actions.UpdateLayoutDashboardIdAction(undefined)
                    )
                  : 0
              );

            this.printer.log(
              enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
              `got empty dashboards from API`
            );
            this.printer.log(
              enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
              `resolved (false)`
            );
            this.router.navigate(['/404']);
            return of(false);
          }
        }),
        catchError(() => {
          this.store
            .select(selectors.getLayoutDashboardId)
            .pipe(take(1))
            .subscribe(x =>
              x
                ? this.store.dispatch(
                    new actions.UpdateLayoutDashboardIdAction(undefined)
                  )
                : 0
            );

          this.printer.log(
            enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
            `caught error accessing API`
          );
          this.printer.log(
            enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
            `resolved (false)`
          );
          this.router.navigate(['/404']);
          return of(false);
        })
      );
  }

  selectDashboardId(id: string): Observable<boolean> {
    let layoutDashboardId: string;
    this.store
      .select(selectors.getLayoutDashboardId)
      .pipe(take(1))
      .subscribe(dashboardId => (layoutDashboardId = dashboardId));

    if (id !== layoutDashboardId) {
      this.printer.log(
        enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
        `selecting dashboard...`
      );
      this.store.dispatch(new actions.UpdateLayoutDashboardIdAction(id));

      return this.store.select(selectors.getLayoutDashboardId).pipe(
        filter(selectedDashboardId => selectedDashboardId === id),
        map(() => true),
        tap(x => {
          this.printer.log(
            enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
            `dashboard selected`
          );
          this.printer.log(
            enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
            `resolved (true)`
          );
        }),
        take(1)
      );
    } else {
      this.printer.log(
        enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
        `dashboard already selected`
      );
      this.printer.log(
        enums.busEnum.DASHBOARD_SELECTED_RESOLVER,
        `resolved (true)`
      );
      return of(true);
    }
  }
}
