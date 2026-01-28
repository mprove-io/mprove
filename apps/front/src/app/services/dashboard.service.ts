import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeCopy } from '#common/functions/make-copy';
import { makeTrackChangeId } from '#common/functions/make-track-change-id';
import { TileX } from '#common/interfaces/backend/tile-x';
import { DashboardField } from '#common/interfaces/blockml/dashboard-field';
import {
  ToBackendCreateDraftDashboardRequestPayload,
  ToBackendCreateDraftDashboardResponse
} from '#common/interfaces/to-backend/dashboards/to-backend-create-draft-dashboard';
import {
  ToBackendDeleteDraftDashboardsRequestPayload,
  ToBackendDeleteDraftDashboardsResponse
} from '#common/interfaces/to-backend/dashboards/to-backend-delete-draft-dashboards';
import {
  ToBackendEditDraftDashboardRequestPayload,
  ToBackendEditDraftDashboardResponse
} from '#common/interfaces/to-backend/dashboards/to-backend-edit-draft-dashboard';
import { DashboardQuery } from '../queries/dashboard.query';
import { DashboardPartsQuery } from '../queries/dashboard-parts.query';
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
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private dashboardPartsQuery: DashboardPartsQuery,
    private dashboardQuery: DashboardQuery
  ) {
    this.nav$.subscribe();
  }

  editDashboard(item: {
    isDraft: boolean;
    tiles: TileX[];
    oldDashboardId: string;
    newDashboardId: string;
    newDashboardFields: DashboardField[];
    timezone: string;
    isQueryCache: boolean;
    cachedQueryMconfigIds: string[];
  }) {
    let {
      isDraft,
      tiles,
      oldDashboardId,
      newDashboardId,
      newDashboardFields,
      timezone,
      isQueryCache,
      cachedQueryMconfigIds
    } = item;

    if (isDraft === true) {
      this.editDraftDashboard({
        tiles: tiles,
        oldDashboardId: oldDashboardId,
        newDashboardId: newDashboardId,
        newDashboardFields: newDashboardFields,
        timezone: timezone
      });
    } else {
      this.navCreateDraftDashboard({
        tiles: tiles,
        oldDashboardId: oldDashboardId,
        newDashboardId: newDashboardId,
        newDashboardFields: newDashboardFields,
        timezone: timezone,
        isQueryCache: isQueryCache,
        cachedQueryMconfigIds: cachedQueryMconfigIds
      });
    }
  }

  navCreateDraftDashboard(item: {
    tiles: TileX[];
    oldDashboardId: string;
    newDashboardId: string;
    newDashboardFields: DashboardField[];
    timezone: string;
    isQueryCache: boolean;
    cachedQueryMconfigIds: string[];
  }) {
    this.spinner.show(APP_SPINNER_NAME);

    let {
      tiles,
      oldDashboardId,
      newDashboardId,
      newDashboardFields,
      timezone,
      isQueryCache,
      cachedQueryMconfigIds
    } = item;

    let newTiles: TileX[] = [];

    tiles.forEach(x => {
      let y: any = makeCopy(x);
      delete y.query;
      delete y.mconfig;
      newTiles.push(y);
    });

    let payload: ToBackendCreateDraftDashboardRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      oldDashboardId: oldDashboardId,
      newDashboardId: newDashboardId,
      newDashboardFields: newDashboardFields,
      tiles: newTiles,
      timezone: timezone,
      isQueryCache: isQueryCache,
      cachedQueryMconfigIds: cachedQueryMconfigIds
    };

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendCreateDraftDashboard,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendCreateDraftDashboardResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let dashboardPart = resp.payload.newDashboardPart;

            let dashboardParts =
              this.dashboardPartsQuery.getValue().dashboardParts;
            let newDashboardParts = [dashboardPart, ...dashboardParts];

            resp.payload.dashboard.tiles.forEach(tile => {
              tile.trackChangeId = makeTrackChangeId({
                mconfig: tile.mconfig,
                query: tile.query
              });
            });

            this.dashboardPartsQuery.update({
              dashboardParts: newDashboardParts
            });
            this.dashboardQuery.update(resp.payload.dashboard);

            let url = this.router
              .createUrlTree([], { relativeTo: this.route })
              .toString();

            let urlArray = url.split('/');
            urlArray.pop();
            urlArray.push(resp.payload.dashboard.dashboardId);

            url = urlArray.join('/') + `?timezone=${timezone}`;

            this.location.replaceState(url);

            this.navigateService.navigateToDashboard({
              dashboardId: newDashboardId
            });
          }

          this.spinner.hide(APP_SPINNER_NAME);
        }),
        take(1)
      )
      .subscribe();
  }

  editDraftDashboard(item: {
    tiles: TileX[];
    oldDashboardId: string;
    newDashboardId: string;
    newDashboardFields: DashboardField[];
    timezone: string;
  }) {
    this.spinner.show(APP_SPINNER_NAME);

    let {
      tiles,
      oldDashboardId,
      newDashboardId,
      newDashboardFields,
      timezone
    } = item;

    let newTiles: TileX[] = [];

    tiles.forEach(x => {
      let y: any = makeCopy(x);
      delete y.query;
      delete y.mconfig;
      newTiles.push(y);
    });

    let payload: ToBackendEditDraftDashboardRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      oldDashboardId: oldDashboardId,
      newDashboardId: newDashboardId,
      newDashboardFields: newDashboardFields,
      tiles: newTiles,
      timezone: timezone
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendEditDraftDashboard,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendEditDraftDashboardResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            resp.payload.dashboard.tiles.forEach(tile => {
              tile.trackChangeId = makeTrackChangeId({
                mconfig: tile.mconfig,
                query: tile.query
              });
            });

            this.dashboardQuery.update(resp.payload.dashboard);
          }

          this.spinner.hide(APP_SPINNER_NAME);
        }),
        take(1)
      )
      .subscribe();
  }

  deleteDraftDashboards(item: { dashboardIds: string[] }) {
    let { dashboardIds } = item;

    let payload: ToBackendDeleteDraftDashboardsRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      dashboardIds: dashboardIds
    };

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendDeleteDraftDashboards,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteDraftDashboardsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let dashboardParts =
              this.dashboardPartsQuery.getValue().dashboardParts;

            this.dashboardPartsQuery.update({
              dashboardParts: dashboardParts.filter(
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
