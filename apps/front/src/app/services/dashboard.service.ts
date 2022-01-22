import { Injectable } from '@angular/core';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { NavQuery } from '../queries/nav.query';
import { DashboardStore } from '../stores/dashboard.store';
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
    dashboard: common.DashboardX;
    oldDashboardId: string;
    newDashboardId: string;
    newDashboardFields: common.DashboardField[];
  }) {
    let {
      dashboard,
      oldDashboardId,
      newDashboardId,
      newDashboardFields
    } = item;

    let reports: common.ReportX[] = [];

    dashboard.reports.forEach(x => {
      let z: any = common.makeCopy(x);
      delete z.query;
      delete z.mconfig;
      reports.push(z);
    });

    let payload: apiToBackend.ToBackendCreateTempDashboardRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      oldDashboardId: oldDashboardId,
      newDashboardId: newDashboardId,
      newDashboardFields: newDashboardFields,
      reports: reports
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateTempDashboard,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendCreateTempDashboardResponse) => {
          this.dashboardStore.update(resp.payload.dashboard);
          this.navigateService.navigateToDashboard(
            resp.payload.dashboard.dashboardId
          );
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
