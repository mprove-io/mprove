import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { DashboardQuery } from '../queries/dashboard.query';
import { DashboardsQuery } from '../queries/dashboards.query';
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
    private navQuery: NavQuery,
    private dashboardsQuery: DashboardsQuery,
    private dashboardQuery: DashboardQuery
  ) {
    this.nav$.subscribe();
  }

  editDashboard(item: {
    isDraft: boolean;
    tiles: common.TileX[];
    oldDashboardId: string;
    newDashboardId: string;
    newDashboardFields: common.DashboardField[];
    deleteFilterFieldId: string;
    deleteFilterTileTitle: string;
    timezone: string;
  }) {
    let {
      isDraft,
      tiles,
      oldDashboardId,
      newDashboardId,
      newDashboardFields,
      deleteFilterFieldId,
      deleteFilterTileTitle,
      timezone
    } = item;

    if (isDraft === true) {
      this.editDraftDashboard({
        tiles: tiles,
        oldDashboardId: oldDashboardId,
        newDashboardId: newDashboardId,
        newDashboardFields: newDashboardFields,
        deleteFilterFieldId: deleteFilterFieldId,
        deleteFilterTileTitle: deleteFilterTileTitle,
        timezone: timezone
      });
    } else {
      this.navCreateDraftDashboard({
        tiles: tiles,
        oldDashboardId: oldDashboardId,
        newDashboardId: newDashboardId,
        newDashboardFields: newDashboardFields,
        deleteFilterFieldId: deleteFilterFieldId,
        deleteFilterTileTitle: deleteFilterTileTitle,
        timezone: timezone
      });
    }
  }

  navCreateDraftDashboard(item: {
    tiles: common.TileX[];
    oldDashboardId: string;
    newDashboardId: string;
    newDashboardFields: common.DashboardField[];
    deleteFilterFieldId: string;
    deleteFilterTileTitle: string;
    timezone: string;
  }) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let {
      tiles,
      oldDashboardId,
      newDashboardId,
      newDashboardFields,
      deleteFilterFieldId,
      deleteFilterTileTitle,
      timezone
    } = item;

    let newTiles: common.TileX[] = [];

    tiles.forEach(x => {
      let y: any = common.makeCopy(x);
      delete y.query;
      delete y.mconfig;
      newTiles.push(y);
    });

    let payload: apiToBackend.ToBackendCreateDraftDashboardRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      oldDashboardId: oldDashboardId,
      newDashboardId: newDashboardId,
      newDashboardFields: newDashboardFields,
      tiles: newTiles,
      deleteFilterFieldId: deleteFilterFieldId,
      deleteFilterTileTitle: deleteFilterTileTitle,
      timezone: timezone
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendCreateDraftDashboard,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateDraftDashboardResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let dashboardPart = resp.payload.newDashboardPart;

            let dashboards = this.dashboardsQuery.getValue().dashboards;
            let newDashboards = [dashboardPart, ...dashboards];

            this.dashboardsQuery.update({ dashboards: newDashboards });

            this.navigateService.navigateToDashboard({
              dashboardId: newDashboardId
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  editDraftDashboard(item: {
    tiles: common.TileX[];
    oldDashboardId: string;
    newDashboardId: string;
    newDashboardFields: common.DashboardField[];
    deleteFilterFieldId: string;
    deleteFilterTileTitle: string;
    timezone: string;
  }) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let {
      tiles,
      oldDashboardId,
      newDashboardId,
      newDashboardFields,
      deleteFilterFieldId,
      deleteFilterTileTitle,
      timezone
    } = item;

    let newTiles: common.TileX[] = [];

    tiles.forEach(x => {
      let y: any = common.makeCopy(x);
      delete y.query;
      delete y.mconfig;
      newTiles.push(y);
    });

    let payload: apiToBackend.ToBackendEditDraftDashboardRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      oldDashboardId: oldDashboardId,
      newDashboardId: newDashboardId,
      newDashboardFields: newDashboardFields,
      tiles: newTiles,
      deleteFilterFieldId: deleteFilterFieldId,
      deleteFilterTileTitle: deleteFilterTileTitle,
      timezone: timezone
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditDraftDashboard,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendEditDraftDashboardResponse) => {
          this.spinner.hide(constants.APP_SPINNER_NAME);

          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.dashboardQuery.update(resp.payload.dashboard);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  deleteDraftDashboards(item: { dashboardIds: string[] }) {
    let { dashboardIds } = item;

    let payload: apiToBackend.ToBackendDeleteDraftDashboardsRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      dashboardIds: dashboardIds
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendDeleteDraftDashboards,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteDraftReportsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let dashboards = this.dashboardsQuery.getValue().dashboards;

            this.dashboardsQuery.update({
              dashboards: dashboards.filter(
                d => dashboardIds.indexOf(d.dashboardId) < 0
              )
            });

            let dashboard = this.dashboardQuery.getValue();

            if (dashboardIds.indexOf(dashboard.dashboardId) > -1) {
              this.navigateService.navigateToDashboards();
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
