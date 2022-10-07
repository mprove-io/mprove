import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { NavQuery } from '../queries/nav.query';
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
    private spinner: NgxSpinnerService,
    private navigateService: NavigateService,
    public navQuery: NavQuery
  ) {
    this.nav$.subscribe();
  }

  navCreateTempDashboard(item: {
    reports: common.ReportX[];
    oldDashboardId: string;
    newDashboardId: string;
    newDashboardFields: common.DashboardField[];
  }) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let { reports, oldDashboardId, newDashboardId, newDashboardFields } = item;

    let newReports: common.ReportX[] = [];

    reports.forEach(x => {
      let z: any = common.makeCopy(x);
      delete z.query;
      delete z.mconfig;
      newReports.push(z);
    });

    let payload: apiToBackend.ToBackendCreateTempDashboardRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      oldDashboardId: oldDashboardId,
      newDashboardId: newDashboardId,
      newDashboardFields: newDashboardFields,
      reports: newReports
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendCreateTempDashboard,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateTempDashboardResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.navigateService.navigateToDashboard(newDashboardId);
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
