import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { checkNavOrgProject } from '../functions/check-nav-org-project';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { RepoQuery } from '../queries/repo.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class RepoStructFilesResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private memberQuery: MemberQuery,
    private uiQuery: UiQuery,
    private repoQuery: RepoQuery,
    private structQuery: StructQuery,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    let nav: NavState;
    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    checkNavOrgProject({
      router: this.router,
      route: route,
      nav: nav
    });

    let branchId = route.params[common.PARAMETER_BRANCH_ID];
    let envId = route.params[common.PARAMETER_ENV_ID];

    let payload: apiToBackend.ToBackendGetRepoRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: branchId,
      envId: envId,
      isFetch: true
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRepo,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetRepoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);

            this.uiQuery.updatePart({
              showChartForSelectedRow:
                resp.payload.user.ui.showChartForSelectedRow,
              showMetricsChartSettings:
                resp.payload.user.ui.showMetricsChartSettings,
              showMetricsChart: resp.payload.user.ui.showMetricsChart,
              timezone: resp.payload.user.ui.timezone,
              timeSpec: resp.payload.user.ui.timeSpec,
              timeRangeFraction: resp.payload.user.ui.timeRangeFraction
            });

            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              branchId: branchId,
              envId: envId,
              needValidate: resp.payload.needValidate
            });
            this.repoQuery.update(resp.payload.repo);

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
