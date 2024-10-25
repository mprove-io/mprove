import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { NavQuery, NavState } from '../queries/nav.query';
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
    private navQuery: NavQuery
  ) {
    this.nav$.subscribe();
  }

  navCreateTempDashboard(item: {
    tiles: common.TileX[];
    oldDashboardId: string;
    newDashboardId: string;
    newDashboardFields: common.DashboardField[];
    deleteFilterFieldId: string;
    deleteFilterMconfigId: string;
  }) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let {
      tiles,
      oldDashboardId,
      newDashboardId,
      newDashboardFields,
      deleteFilterFieldId,
      deleteFilterMconfigId
    } = item;

    let newTiles: common.TileX[] = [];

    tiles.forEach(x => {
      let y: any = common.makeCopy(x);
      delete y.query;
      delete y.mconfig;
      newTiles.push(y);
    });

    let payload: apiToBackend.ToBackendCreateTempDashboardRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      oldDashboardId: oldDashboardId,
      newDashboardId: newDashboardId,
      newDashboardFields: newDashboardFields,
      tiles: newTiles,
      deleteFilterFieldId: deleteFilterFieldId,
      deleteFilterMconfigId: deleteFilterMconfigId
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
