import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import equal from 'fast-deep-equal';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import {
  EMPTY_REPORT_ID,
  LAST_SELECTED_REPORT_ID,
  PARAMETER_REPORT_ID,
  PATH_INFO,
  PATH_ORG,
  PATH_PROJECT
} from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { TimeSpecEnum } from '~common/enums/timespec.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { ReportX } from '~common/interfaces/backend/report-x';
import {
  ToBackendGetReportRequestPayload,
  ToBackendGetReportResponse
} from '~common/interfaces/to-backend/reports/to-backend-get-report';
import { checkNavOrgProjectRepoBranchEnv } from '../functions/check-nav-org-project-repo-branch-env';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { ReportQuery } from '../queries/report.query';
import { ReportsQuery } from '../queries/reports.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
import { UserQuery } from '../queries/user.query';
import { ApiService } from '../services/api.service';
import { NavigateService } from '../services/navigate.service';

@Injectable({ providedIn: 'root' })
export class StructReportResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private userQuery: UserQuery,
    private apiService: ApiService,
    private reportQuery: ReportQuery,
    private reportsQuery: ReportsQuery,
    private structQuery: StructQuery,
    private memberQuery: MemberQuery,
    private navigateService: NavigateService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    let timezoneParam: TimeSpecEnum = route.queryParams?.timezone;
    let timeSpecParam: TimeSpecEnum = route.queryParams?.timeSpec;
    let timeRangeParam: TimeSpecEnum = route.queryParams?.timeRange;

    let uiState = this.uiQuery.getValue();
    let structState = this.structQuery.getValue();

    let timezone =
      structState.allowTimezones === false
        ? structState.defaultTimezone
        : isDefined(timezoneParam)
          ? timezoneParam.split('-').join('/')
          : uiState.timezone;

    return this.resolveRoute({
      route: route,
      showSpinner: false,
      timezone: timezone,
      timeSpec: isDefined(timeSpecParam) ? timeSpecParam : uiState.timeSpec,
      timeRangeFractionBrick: isDefined(timeRangeParam)
        ? timeRangeParam
        : // .split('-')
          // .join('/')
          // .split('_')
          // .join(' ')
          // .split('~')
          // .join(':')
          uiState.timeRangeFraction.brick
    });
  }

  resolveRoute(item: {
    route: ActivatedRouteSnapshot;
    showSpinner: boolean;
    timeSpec: TimeSpecEnum;
    timezone: string;
    timeRangeFractionBrick: string;
  }): Observable<boolean> {
    let { route, showSpinner, timezone, timeSpec, timeRangeFractionBrick } =
      item;

    let nav: NavState;
    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    let report: ReportX;
    this.reportQuery
      .select()
      .pipe(
        tap(x => {
          report = x;
        }),
        take(1)
      )
      .subscribe();

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

    if (parametersReportId === LAST_SELECTED_REPORT_ID) {
      let reports = this.reportsQuery.getValue().reports;
      let projectReportLinks = this.uiQuery.getValue().projectReportLinks;

      let pLink = projectReportLinks.find(
        link => link.projectId === nav.projectId
      );

      if (isDefined(pLink) && pLink.reportId === EMPTY_REPORT_ID) {
        this.navigateService.navigateToReport({
          reportId: EMPTY_REPORT_ID
        });

        return of(false);
      } else if (isDefined(pLink)) {
        let pReport = reports.find(r => r.reportId === pLink.reportId);

        if (isDefined(pReport)) {
          this.navigateService.navigateToReport({
            reportId: pReport.reportId
          });
        } else {
          this.navigateService.navigateToReports();
        }

        return of(false);
      } else {
        this.navigateService.navigateToReports();

        return of(false);
      }
    }

    let payload: ToBackendGetReportRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      reportId: parametersReportId,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetReport,
        payload: payload,
        showSpinner: showSpinner
      })
      .pipe(
        map((resp: ToBackendGetReportResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);

            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            this.reportQuery.update(resp.payload.report);

            let uiState = this.uiQuery.getValue();

            if (
              uiState.timezone !== resp.payload.report.timezone ||
              uiState.timeSpec !== resp.payload.report.timeSpec ||
              !equal(
                uiState.timeRangeFraction,
                resp.payload.report.timeRangeFraction
              )
            ) {
              this.uiQuery.updatePart({
                timezone: resp.payload.report.timezone,
                timeSpec: resp.payload.report.timeSpec,
                timeRangeFraction: resp.payload.report.timeRangeFraction
              });
            }

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
