import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { checkNavOrgProjectRepoBranchEnv } from '../functions/check-nav-org-project-repo-branch-env';
import { ChartQuery } from '../queries/chart.query';
import { ChartsQuery } from '../queries/charts.query';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
import { UserQuery } from '../queries/user.query';
import { ApiService } from '../services/api.service';
import { NavigateService } from '../services/navigate.service';
import { UiService } from '../services/ui.service';

@Injectable({ providedIn: 'root' })
export class StructChartResolver implements Resolve<Observable<boolean>> {
  constructor(
    private apiService: ApiService,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private structQuery: StructQuery,
    private chartsQuery: ChartsQuery,
    private chartQuery: ChartQuery,
    private memberQuery: MemberQuery,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private navigateService: NavigateService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let timezoneParam: common.TimeSpecEnum = route.queryParams?.timezone;

    let uiState = this.uiQuery.getValue();
    let structState = this.structQuery.getValue();

    let timezone =
      structState.allowTimezones === false
        ? structState.defaultTimezone
        : common.isDefined(timezoneParam)
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
  }): Observable<boolean> {
    let { chartId, route, showSpinner, timezone } = item;

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

    let parametersChartId = common.isDefined(chartId)
      ? chartId
      : route?.params[common.PARAMETER_CHART_ID];

    if (parametersChartId === common.EMPTY_CHART_ID) {
      this.chartQuery.reset();
      return of(true);
    }

    if (parametersChartId === common.LAST_SELECTED_CHART_ID) {
      let charts = this.chartsQuery.getValue().charts;
      let projectModelLinks = this.uiQuery.getValue().projectModelLinks;
      let projectChartLinks = this.uiQuery.getValue().projectChartLinks;

      let pChartLink = projectChartLinks.find(
        link => link.projectId === nav.projectId
      );

      let pModelLink = projectModelLinks.find(
        link => link.projectId === nav.projectId
      );

      if (
        common.isDefined(pChartLink) &&
        pChartLink.chartId === common.EMPTY_CHART_ID &&
        common.isDefined(pModelLink)
      ) {
        this.navigateService.navigateToChart({
          modelId: pModelLink.modelId,
          chartId: common.EMPTY_CHART_ID
        });

        return of(false);
      } else if (common.isDefined(pChartLink)) {
        let pChart = charts.find(r => r.chartId === pChartLink.chartId);

        if (common.isDefined(pChart)) {
          this.navigateService.navigateToChart({
            modelId: pChart.modelId,
            chartId: pChart.chartId
          });
        } else {
          this.navigateService.navigateToCharts();
        }

        return of(false);
      } else {
        this.navigateService.navigateToCharts();

        return of(false);
      }
    }

    let payload: apiToBackend.ToBackendGetChartRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      chartId: parametersChartId,
      timezone: timezone
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetChart,
        payload: payload,
        showSpinner: showSpinner
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetChartResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);
            this.chartQuery.update(resp.payload.chart);

            return true;
          } else if (
            resp.info?.status === common.ResponseInfoStatusEnum.Error &&
            resp.info.error.message ===
              common.ErEnum.BACKEND_BRANCH_DOES_NOT_EXIST
          ) {
            this.router.navigate([
              common.PATH_ORG,
              nav.orgId,
              common.PATH_PROJECT,
              nav.projectId,
              common.PATH_INFO
            ]);

            return false;
          } else {
            return false;
          }
        })
      );
  }
}
