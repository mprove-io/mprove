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
import { TimeQuery } from '../queries/time.query';
import { UserQuery } from '../queries/user.query';
import { ApiService } from '../services/api.service';
import { StructService } from '../services/struct.service';

@Injectable({ providedIn: 'root' })
export class StructRepResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private timeQuery: TimeQuery,
    private userQuery: UserQuery,
    private apiService: ApiService,
    private structService: StructService,
    private repQuery: RepQuery,
    private structQuery: StructQuery,
    private memberQuery: MemberQuery,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.resolveRoute({ route: route, showSpinner: false });
  }

  resolveRoute(item: {
    route: ActivatedRouteSnapshot;
    showSpinner: boolean;
  }): Observable<boolean> {
    let { route, showSpinner } = item;

    let nav: NavState;
    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    let rep: common.Rep;
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
    let draftParam: common.DraftEnum = route.queryParams?.draft;

    let timeState = this.timeQuery.getValue();

    let payload: apiToBackend.ToBackendGetRepRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      repId: parametersRepId,
      draft: draftParam === common.DraftEnum.Yes,
      withData: false,
      timezone: timeState.timezone,
      timeSpec: timeState.timeSpec,
      timeRangeFraction: timeState.timeRangeFraction
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
