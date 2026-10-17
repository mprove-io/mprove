import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { TileX } from '#common/types/backend/parts/tile/tile-x';
import type { ToBackendCreateDraftDashboardOutput } from '#common/types/backend/routes/dashboards/create-draft-dashboard/create-draft-dashboard-output';
import type { ToBackendCreateDraftDashboardRequest } from '#common/types/backend/routes/dashboards/create-draft-dashboard/create-draft-dashboard-request';
import type { ToBackendDeleteDraftDashboardsOutput } from '#common/types/backend/routes/dashboards/delete-draft-dashboards/delete-draft-dashboards-output';
import type { ToBackendDeleteDraftDashboardsRequest } from '#common/types/backend/routes/dashboards/delete-draft-dashboards/delete-draft-dashboards-request';
import type { ToBackendEditDraftDashboardOutput } from '#common/types/backend/routes/dashboards/edit-draft-dashboard/edit-draft-dashboard-output';
import type { ToBackendEditDraftDashboardRequest } from '#common/types/backend/routes/dashboards/edit-draft-dashboard/edit-draft-dashboard-request';
import type { DashboardField } from '#common/types/blockml/parts/dashboard/dashboard-field';
import { makeTrackChangeId } from '#front/app/functions/make-track-change-id';
import { DashboardQuery } from '../queries/dashboard.query';
import { DashboardUnitsQuery } from '../queries/dashboard-units.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { ApiService } from './api.service';
import { AppSpinnerService } from './app-spinner.service';
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
    private appSpinnerService: AppSpinnerService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
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

    let payload: ToBackendCreateDraftDashboardRequest['input'] = {
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
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendCreateDraftDashboardOutput = resp.output;

          output.dashboard.tiles.forEach(tile => {
            tile.trackChangeId = makeTrackChangeId({
              mconfig: tile.mconfig,
              query: tile.query
            });
          });

          this.dashboardUnitsQuery.update({
            dashboardUnitDrafts: output.dashboardUnitDrafts,
            dashboardSpaceNodes:
              this.dashboardUnitsQuery.getValue().dashboardSpaceNodes
          });

          this.dashboardQuery.update(output.dashboard);

          let url = this.router
            .createUrlTree([], { relativeTo: this.route })
            .toString();

          let urlArray = url.split('/');

          urlArray.pop();

          urlArray.push(output.dashboard.dashboardId);

          url = urlArray.join('/') + `?timezone=${timezone}`;

          this.location.replaceState(url);

          this.navigateService.navigateToDashboard({
            dashboardId: newDashboardId
          });
        }),
        take(1),
        this.appSpinnerService.track()
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

    let payload: ToBackendEditDraftDashboardRequest['input'] = {
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
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendEditDraftDashboardOutput = resp.output;

          output.dashboard.tiles.forEach(tile => {
            tile.trackChangeId = makeTrackChangeId({
              mconfig: tile.mconfig,
              query: tile.query
            });
          });

          this.dashboardQuery.update(output.dashboard);
        }),
        take(1),
        this.appSpinnerService.track()
      )
      .subscribe();
  }

  deleteDraftDashboards(item: { dashboardIds: string[] }) {
    let { dashboardIds } = item;

    let payload: ToBackendDeleteDraftDashboardsRequest['input'] = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      dashboardIds: dashboardIds
    };

    this.apiService
      .req({
        route: 'api/ToBackendDeleteDraftDashboards',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendDeleteDraftDashboardsOutput = resp.output;

          this.dashboardUnitsQuery.update({
            dashboardUnitDrafts: output.dashboardUnitDrafts,
            dashboardSpaceNodes:
              this.dashboardUnitsQuery.getValue().dashboardSpaceNodes
          });

          let dashboard = this.dashboardQuery.getValue();

          if (dashboardIds.indexOf(dashboard.dashboardId) > -1) {
            this.navigateService.navigateToDashboards();
          }
        }),
        take(1),
        this.appSpinnerService.track()
      )
      .subscribe();
  }
}
