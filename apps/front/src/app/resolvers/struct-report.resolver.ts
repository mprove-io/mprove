import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import equal from 'fast-deep-equal';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import {
  PARAMETER_REPORT_ID,
  PATH_INFO,
  PATH_ORG,
  PATH_PROJECT
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendGetReportRequest } from '#common/types/backend/routes/reports/get-report/get-report-request';
import type { ToBackendGetReportResponse } from '#common/types/backend/routes/reports/get-report/get-report-response';
import type { TimeSpec } from '#common/types/shared/time/timespec';
import { checkNavOrgProjectRepoBranchEnv } from '../functions/check-nav-org-project-repo-branch-env';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { ReportQuery } from '../queries/report.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
import { UserQuery } from '../queries/user.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class StructReportResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private userQuery: UserQuery,
    private apiService: ApiService,
    private reportQuery: ReportQuery,
    private structQuery: StructQuery,
    private memberQuery: MemberQuery,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    let timezoneParam: TimeSpec = route.queryParams?.timezone;
    let timeSpecParam: TimeSpec = route.queryParams?.timeSpec;
    let timeRangeParam: TimeSpec = route.queryParams?.timeRange;

    let uiState = this.uiQuery.getValue();
    let structState = this.structQuery.getValue();

    let timezone =
      structState.mproveConfig.allowTimezones === false
        ? structState.mproveConfig.defaultTimezone
        : isDefined(timezoneParam)
          ? timezoneParam
          : uiState.timezone;

    return this.resolveRoute({
      route: route,
      showSpinner: false,
      timezone: timezone,
      timeSpec: isDefined(timeSpecParam) ? timeSpecParam : uiState.timeSpec,
      timeRangeFractionBrick: isDefined(timeRangeParam)
        ? timeRangeParam
        : uiState.timeRangeFraction.brick
    });
  }

  resolveRoute(item: {
    route: ActivatedRouteSnapshot;
    showSpinner: boolean;
    timeSpec: TimeSpec;
    timezone: string;
    timeRangeFractionBrick: string;
    skipCache?: boolean;
  }): Observable<boolean> {
    let {
      route,
      showSpinner,
      timezone,
      timeSpec,
      timeRangeFractionBrick,
      skipCache
    } = item;

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

    let parametersReportId = route.params[PARAMETER_REPORT_ID];

    let reportState = this.reportQuery.getValue();

    if (
      skipCache !== true &&
      parametersReportId === reportState.reportId &&
      reportState.structId === this.structQuery.getValue().structId
    ) {
      return of(true);
    }

    let payload: ToBackendGetReportRequest['input'] = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      reportId: parametersReportId,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetReport',
        payload: payload,
        showSpinner: showSpinner
      })
      .pipe(
        map((resp: ToBackendGetReportResponse) => {
          if (resp.type === 'Success') {
            this.memberQuery.update(resp.output.userMember);

            this.structQuery.update(resp.output.struct);
            this.navQuery.updatePart({
              needValidate: resp.output.needValidate
            });

            this.reportQuery.update(resp.output.report);

            let uiState = this.uiQuery.getValue();

            if (
              uiState.timezone !== resp.output.report.timezone ||
              uiState.timeSpec !== resp.output.report.timeSpec ||
              !equal(
                uiState.timeRangeFraction,
                resp.output.report.timeRangeFraction
              )
            ) {
              this.uiQuery.updatePart({
                timezone: resp.output.report.timezone,
                timeSpec: resp.output.report.timeSpec,
                timeRangeFraction: resp.output.report.timeRangeFraction
              });
            }

            return true;
          } else if (
            resp.type === 'Failure' &&
            resp.error.code === 'BACKEND_BRANCH_DOES_NOT_EXIST'
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
