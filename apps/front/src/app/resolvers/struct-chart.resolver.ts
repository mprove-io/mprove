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
  EMPTY_CHART_ID,
  PARAMETER_CHART_ID,
  PATH_INFO,
  PATH_ORG,
  PATH_PROJECT
} from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ToBackendGetChartRequestPayload,
  ToBackendGetChartResponse
} from '#common/interfaces/to-backend/charts/to-backend-get-chart';
import { checkNavOrgProjectRepoBranchEnv } from '../functions/check-nav-org-project-repo-branch-env';
import { ChartQuery } from '../queries/chart.query';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
import { UserQuery } from '../queries/user.query';
import { ApiService } from '../services/api.service';
import { UiService } from '../services/ui.service';

@Injectable({ providedIn: 'root' })
export class StructChartResolver implements Resolve<Observable<boolean>> {
  constructor(
    private apiService: ApiService,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private structQuery: StructQuery,
    private chartQuery: ChartQuery,
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
          ? timezoneParam.split('-').join('/')
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
    chartId?: string;
    route: ActivatedRouteSnapshot;
    showSpinner: boolean;
    timezone: string;
    skipCache?: boolean;
  }): Observable<boolean> {
    let { chartId, route, showSpinner, timezone, skipCache } = item;

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

    let parametersChartId = isDefined(chartId)
      ? chartId
      : route?.params[PARAMETER_CHART_ID];

    if (parametersChartId === EMPTY_CHART_ID) {
      this.chartQuery.reset();
      return of(true);
    }

    let chartState = this.chartQuery.getValue();

    if (
      skipCache !== true &&
      parametersChartId === chartState.chartId &&
      chartState.structId === this.structQuery.getValue().structId
    ) {
      return of(true);
    }

    let payload: ToBackendGetChartRequestPayload = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      chartId: parametersChartId,
      timezone: timezone
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetChart,
        payload: payload,
        showSpinner: showSpinner
      })
      .pipe(
        map((resp: ToBackendGetChartResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);
            this.chartQuery.update(resp.payload.chart);

            return true;
          } else if (
            resp.info?.status === ResponseInfoStatusEnum.Error &&
            resp.info.error.message === ErEnum.BACKEND_BRANCH_DOES_NOT_EXIST
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
