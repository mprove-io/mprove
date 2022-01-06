import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { DashboardQuery } from '../queries/dashboard.query';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { DashboardState, DashboardStore } from '../stores/dashboard.store';
import { NavState } from '../stores/nav.store';

@Injectable({ providedIn: 'root' })
export class DashboardResolver implements Resolve<Observable<boolean>> {
  constructor(
    private apiService: ApiService,
    private navQuery: NavQuery,
    private dashboardQuery: DashboardQuery,
    private dashboardStore: DashboardStore
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let parametersDashboardId = route.params[common.PARAMETER_DASHBOARD_ID];

    let dashboard: common.Dashboard;
    this.dashboardQuery
      .select()
      .pipe(
        tap(x => {
          dashboard = x;
        }),
        take(1)
      )
      .subscribe();

    let nav: NavState;
    this.navQuery
      .select()
      .pipe(
        tap(x => {
          nav = x;
        }),
        take(1)
      )
      .subscribe();

    let payload: apiToBackend.ToBackendGetDashboardRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      isRepoProd: nav.isRepoProd,
      dashboardId: parametersDashboardId
    };

    if (dashboard.dashboardId === parametersDashboardId) {
      return of(true);
    } else {
      return this.apiService
        .req(
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboard,
          payload
        )
        .pipe(
          map((resp: apiToBackend.ToBackendGetDashboardResponse) => {
            let dashboardState: DashboardState = resp.payload.dashboard;

            dashboardState.reports.forEach(x => {
              x.mconfig = resp.payload.dashboardMconfigs.find(
                m => m.mconfigId === x.mconfigId
              );
              x.query = resp.payload.dashboardQueries.find(
                q => q.queryId === x.queryId
              );
            });

            this.dashboardStore.update(dashboardState);
            return true;
          })
        );
    }
  }
}
