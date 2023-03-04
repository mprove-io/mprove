import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { checkNavOrgProjectRepoBranchEnv } from '../functions/check-nav-org-project-repo-branch-env';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { RepQuery } from '../queries/rep.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
import { UserQuery } from '../queries/user.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class StructRepResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private userQuery: UserQuery,
    private apiService: ApiService,
    private repQuery: RepQuery,
    private structQuery: StructQuery,
    private memberQuery: MemberQuery,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    let timezoneParam: common.TimeSpecEnum = route.queryParams?.timezone;
    let timeSpecParam: common.TimeSpecEnum = route.queryParams?.timeSpec;
    let timeRangeParam: common.TimeSpecEnum = route.queryParams?.timeRange;

    let uiState = this.uiQuery.getValue();

    return this.resolveRoute({
      route: route,
      showSpinner: false,
      timezone: common.isDefined(timezoneParam)
        ? timezoneParam.split('-').join('/')
        : uiState.timezone,
      timeSpec: common.isDefined(timeSpecParam)
        ? timeSpecParam
        : uiState.timeSpec,
      timeRangeFractionBrick: common.isDefined(timeRangeParam)
        ? timeRangeParam
            .split('-')
            .join('/')
            .split('_')
            .join(' ')
            .split('~')
            .join(':')
        : uiState.timeRangeFraction.brick
    });
  }

  resolveRoute(item: {
    route: ActivatedRouteSnapshot;
    showSpinner: boolean;
    timeSpec: common.TimeSpecEnum;
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

    let rep: common.RepX;
    this.repQuery
      .select()
      .pipe(
        tap(x => {
          rep = x;
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

    let parametersRepId = route.params[common.PARAMETER_REP_ID];

    let payload: apiToBackend.ToBackendGetRepRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      repId: parametersRepId,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick
    };

    return this.apiService
      .req({
        pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRep,
        payload: payload,
        showSpinner: showSpinner
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetRepResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);

            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            this.repQuery.update(resp.payload.rep);

            this.uiQuery.updatePart({
              timezone: resp.payload.rep.timezone,
              timeSpec: resp.payload.rep.timeSpec,
              timeRangeFraction: resp.payload.rep.timeRangeFraction
            });

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
              common.PATH_SETTINGS
            ]);

            return false;
          } else {
            return false;
          }
        })
      );
  }
}
