import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { DashboardsStore } from '../stores/dashboards.store';
import { NavState } from '../stores/nav.store';
import { StructModelsResolver } from './struct-models.resolver';

@Injectable({ providedIn: 'root' })
export class StructModelsDashboardsResolver
  implements Resolve<Promise<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private structModelsResolver: StructModelsResolver,
    private dashboardsStore: DashboardsStore
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Promise<boolean> {
    let pass = await this.structModelsResolver.resolve(route);

    if (pass === false) {
      return false;
    }

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

    let payload: apiToBackend.ToBackendGetDashboardsRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboards,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetDashboardsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.dashboardsStore.update({
              dashboards: resp.payload.dashboards
            });
            return true;
          } else {
            return false;
          }
        })
      )
      .toPromise();
  }
}
