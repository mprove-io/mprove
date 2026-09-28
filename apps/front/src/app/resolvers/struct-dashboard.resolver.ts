import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import {
  PARAMETER_DASHBOARD_ID,
  PATH_INFO,
  PATH_ORG,
  PATH_PROJECT
} from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendGetDashboardRequest } from '#common/zod/backend/routes/dashboards/get-dashboard/get-dashboard-request';
import type { ToBackendGetDashboardResponse } from '#common/zod/backend/routes/dashboards/get-dashboard/get-dashboard-response';
import { makeTrackChangeId } from '#front/app/functions/make-track-change-id';
import { checkNavOrgProjectRepoBranchEnv } from '../functions/check-nav-org-project-repo-branch-env';
import { DashboardQuery } from '../queries/dashboard.query';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
import { UserQuery } from '../queries/user.query';
import { ApiService } from '../services/api.service';
import { UiService } from '../services/ui.service';

@Injectable({ providedIn: 'root' })
export class StructDashboardResolver implements Resolve<Observable<boolean>> {
  constructor(
    private apiService: ApiService,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private dashboardQuery: DashboardQuery,
    private structQuery: StructQuery,
    private memberQuery: MemberQuery,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let timezoneParam: TimeSpecEnum = route.queryParams?.timezone;

    let uiState = this.uiQuery.getValue();
    let structState = this.structQuery.getValue();

    let timezone =
      structState.mproveConfig.allowTimezones === false
        ? structState.mproveConfig.defaultTimezone
        : isDefined(timezoneParam)
          ? timezoneParam
          : uiState.timezone;

    if (uiState.timezone !== timezone) {
      this.uiQuery.updatePart({ timezone: timezone });
      this.uiService.setUserUi({ timezone: timezone });
    }

    return this.resolveRoute({
      route: route,
      showSpinner: false,
      timezone: timezone
    });
  }

  resolveRoute(item: {
    dashboardId?: string;
    route: ActivatedRouteSnapshot;
    showSpinner: boolean;
    timezone: string;
    skipCache?: boolean;
  }): Observable<boolean> {
    let { dashboardId, route, showSpinner, timezone, skipCache } = item;

    let nav: NavState;
    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    let userId;
    this.userQuery.userId$
      .pipe(
        tap(x => (userId = x)),
        take(1)
      )
      .subscribe();

    checkNavOrgProjectRepoBranchEnv({
      router: this.router,
      route: route,
      nav: nav,
      userId: userId
    });

    let parametersDashboardId = isDefined(dashboardId)
      ? dashboardId
      : route?.params[PARAMETER_DASHBOARD_ID];

    let dashboardState = this.dashboardQuery.getValue();

    if (
      skipCache !== true &&
      parametersDashboardId === dashboardState.dashboardId &&
      dashboardState.structId === this.structQuery.getValue().structId
    ) {
      return of(true);
    }

    let payload: ToBackendGetDashboardRequest['input'] = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      dashboardId: parametersDashboardId,
      timezone: timezone
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetDashboard',
        payload: payload,
        showSpinner: showSpinner
      })
      .pipe(
        map((resp: ToBackendGetDashboardResponse) => {
          if (resp?.type === 'Success') {
            this.memberQuery.update(resp.output.userMember);

            this.structQuery.update(resp.output.struct);
            this.navQuery.updatePart({
              needValidate: resp.output.needValidate
            });

            resp.output.dashboard.tiles.forEach(tile => {
              tile.trackChangeId = makeTrackChangeId({
                mconfig: tile.mconfig,
                query: tile.query
              });
            });

            this.dashboardQuery.update(resp.output.dashboard);

            return true;
          } else if (
            resp?.type === 'Failure' &&
            resp.error.code === ErEnum.BACKEND_BRANCH_DOES_NOT_EXIST
          ) {
            this.router.navigate([
              PATH_ORG,
              nav.orgId,
              PATH_PROJECT,
              nav.projectId,
              PATH_INFO
            ]);

            return false;
          } else {
            return false;
          }
        })
      );
  }
}
