import { Injectable } from '@angular/core';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { makeExtendedFilters } from '../functions/make-extended-filters';
import { NavQuery } from '../queries/nav.query';
import { DashboardState, DashboardStore } from '../stores/dashboard.store';
import { DashboardWithExtendedFilters } from '../stores/dashboards.store';
import { NavState } from '../stores/nav.store';
import { ApiService } from './api.service';
import { NavigateService } from './navigate.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
    })
  );

  constructor(
    private apiService: ApiService,
    private dashboardStore: DashboardStore,
    private navigateService: NavigateService,
    public navQuery: NavQuery
  ) {
    this.nav$.subscribe();
  }

  navCreateTempDashboard(item: {
    oldDashboardId: string;
    newDashboardId: string;
    newDashboardFields: common.DashboardField[];
  }) {
    let { oldDashboardId, newDashboardId, newDashboardFields } = item;

    let payload: apiToBackend.ToBackendCreateTempDashboardRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      oldDashboardId: oldDashboardId,
      newDashboardId: newDashboardId,
      newDashboardFields: newDashboardFields
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateTempDashboard,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendCreateTempDashboardResponse) => {
          let z: DashboardWithExtendedFilters = Object.assign(
            {},
            resp.payload.dashboard,
            {
              extendedFilters: makeExtendedFilters(resp.payload.dashboard)
            }
          );

          let dashboardState: DashboardState = z;

          dashboardState.reports.forEach(x => {
            x.mconfig = resp.payload.dashboardMconfigs.find(
              m => m.mconfigId === x.mconfigId
            );
            x.query = resp.payload.dashboardQueries.find(
              q => q.queryId === x.queryId
            );
          });

          this.dashboardStore.update(dashboardState);
          this.navigateService.navigateToDashboard(dashboardState.dashboardId);
        }),
        take(1)
      )
      .subscribe();
  }

  // optimisticNavCreateMconfigAndQuery(item: {
  //   newMconfig: common.Mconfig;
  //   queryId: string;
  // }) {
  //   let { newMconfig, queryId } = item;

  //   let payload: apiToBackend.ToBackendCreateTempMconfigAndQueryRequestPayload = {
  //     mconfig: newMconfig
  //   };

  //   let optMconfig = common.makeCopy(newMconfig);

  //   optMconfig.queryId = queryId;

  //   this.mqStore.update((state: MqState) =>
  //     Object.assign({}, state, {
  //       mconfig: optMconfig,
  //       query: state.query
  //     })
  //   );

  //   this.navigateService.navigateMconfigQuery({
  //     mconfigId: optMconfig.mconfigId,
  //     queryId: queryId
  //   });

  //   this.apiService
  //     .req(
  //       apiToBackend.ToBackendRequestInfoNameEnum
  //         .ToBackendCreateTempMconfigAndQuery,
  //       payload,
  //       true
  //     )
  //     .pipe(
  //       map((resp: apiToBackend.ToBackendCreateTempMconfigAndQueryResponse) => {
  //         // let { mconfig, query } = resp.payload;
  //         // this.mqStore.update({ mconfig: mconfig, query: query });
  //         // this.navigateService.navigateMconfigQuery({
  //         //   mconfigId: mconfig.mconfigId,
  //         //   queryId: mconfig.queryId
  //         // });
  //       }),
  //       take(1)
  //     )
  //     .subscribe();
  // }
}
