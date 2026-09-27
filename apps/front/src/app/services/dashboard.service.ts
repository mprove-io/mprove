import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { ToBackendCreateDraftDashboardInput } from '#common/zod/backend/routes/dashboards/create-draft-dashboard/create-draft-dashboard-request';
import type { ToBackendCreateDraftDashboardResponse } from '#common/zod/backend/routes/dashboards/create-draft-dashboard/create-draft-dashboard-response';
import type { ToBackendDeleteDraftDashboardsInput } from '#common/zod/backend/routes/dashboards/delete-draft-dashboards/delete-draft-dashboards-request';
import type { ToBackendDeleteDraftDashboardsResponse } from '#common/zod/backend/routes/dashboards/delete-draft-dashboards/delete-draft-dashboards-response';
import type { ToBackendEditDraftDashboardInput } from '#common/zod/backend/routes/dashboards/edit-draft-dashboard/edit-draft-dashboard-request';
import type { ToBackendEditDraftDashboardResponse } from '#common/zod/backend/routes/dashboards/edit-draft-dashboard/edit-draft-dashboard-response';
import type { TileX } from '#common/zod/backend/tile-x';
import type { DashboardField } from '#common/zod/blockml/dashboard-field';
import { makeTrackChangeId } from '#front/app/functions/make-track-change-id';
import { DashboardQuery } from '../queries/dashboard.query';
import { DashboardUnitsQuery } from '../queries/dashboard-units.query';
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
    private dashboardUnitsQuery: DashboardUnitsQuery,
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

    let payload: ToBackendCreateDraftDashboardInput = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
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
        route: 'api/ToBackendCreateDraftDashboard',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendCreateDraftDashboardResponse) => {
          if (resp.result?.type === 'Success') {
            resp.result.value.dashboard.tiles.forEach(tile => {
              tile.trackChangeId = makeTrackChangeId({
                mconfig: tile.mconfig,
                query: tile.query
              });
            });

            this.dashboardUnitsQuery.update({
              dashboardUnitDrafts: resp.result.value.dashboardUnitDrafts,
              dashboardSpaceNodes:
                this.dashboardUnitsQuery.getValue().dashboardSpaceNodes
            });
            this.dashboardQuery.update(resp.result.value.dashboard);

            let url = this.router
              .createUrlTree([], { relativeTo: this.route })
              .toString();

            let urlArray = url.split('/');
            urlArray.pop();
            urlArray.push(resp.result.value.dashboard.dashboardId);

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

    let payload: ToBackendEditDraftDashboardInput = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
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
        route: 'api/ToBackendEditDraftDashboard',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendEditDraftDashboardResponse) => {
          if (resp.result?.type === 'Success') {
            resp.result.value.dashboard.tiles.forEach(tile => {
              tile.trackChangeId = makeTrackChangeId({
                mconfig: tile.mconfig,
                query: tile.query
              });
            });

            this.dashboardQuery.update(resp.result.value.dashboard);
          }

          this.spinner.hide(APP_SPINNER_NAME);
        }),
        take(1)
      )
      .subscribe();
  }

  deleteDraftDashboards(item: { dashboardIds: string[] }) {
    let { dashboardIds } = item;

    let payload: ToBackendDeleteDraftDashboardsInput = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      dashboardIds: dashboardIds
    };

    this.apiService
      .req({
        route: 'api/ToBackendDeleteDraftDashboards',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteDraftDashboardsResponse) => {
          if (resp.result?.type === 'Success') {
            this.dashboardUnitsQuery.update({
              dashboardUnitDrafts: resp.result.value.dashboardUnitDrafts,
              dashboardSpaceNodes:
                this.dashboardUnitsQuery.getValue().dashboardSpaceNodes
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
