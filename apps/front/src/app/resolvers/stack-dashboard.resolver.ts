import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { DashboardQuery } from '../queries/dashboard.query';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { DashboardStore } from '../stores/dashboard.store';
import { NavState } from '../stores/nav.store';
import { StackResolver } from './stack.resolver';

@Injectable({ providedIn: 'root' })
export class StackDashboardResolver implements Resolve<Promise<boolean>> {
  constructor(
    private apiService: ApiService,
    private navQuery: NavQuery,
    private stackResolver: StackResolver,
    private dashboardQuery: DashboardQuery,
    private dashboardStore: DashboardStore
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Promise<boolean> {
    let pass = await this.stackResolver.resolve(route);

    if (pass === false) {
      return false;
    }

    let parametersDashboardId = route.params[common.PARAMETER_DASHBOARD_ID];

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

    return this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboard,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetDashboardResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.dashboardStore.update(resp.payload.dashboard);
            return true;
          } else {
            return false;
          }
        })
      )
      .toPromise();
  }
}
