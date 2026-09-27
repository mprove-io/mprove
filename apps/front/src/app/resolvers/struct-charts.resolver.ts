import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { PATH_INFO, PATH_ORG, PATH_PROJECT } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import type { ToBackendGetChartsInput } from '#common/zod/backend/routes/charts/get-charts/get-charts-request';
import type { ToBackendGetChartsResponse } from '#common/zod/backend/routes/charts/get-charts/get-charts-response';
import { checkNavOrgProjectRepoBranchEnv } from '../functions/check-nav-org-project-repo-branch-env';
import { ChartsQuery } from '../queries/charts.query';
import { MemberQuery } from '../queries/member.query';
import { ModelsQuery } from '../queries/models.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { StructQuery } from '../queries/struct.query';
import { UserQuery } from '../queries/user.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class StructChartsResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private apiService: ApiService,
    private chartsQuery: ChartsQuery,
    private modelsQuery: ModelsQuery,
    private structQuery: StructQuery,
    private memberQuery: MemberQuery,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
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

    let payload: ToBackendGetChartsInput = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetCharts',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetChartsResponse) => {
          if (resp.result?.type === 'Success') {
            this.memberQuery.update(resp.result.value.userMember);

            this.structQuery.update(resp.result.value.struct);
            this.navQuery.updatePart({
              needValidate: resp.result.value.needValidate
            });
            this.modelsQuery.update({ models: resp.result.value.models });

            this.chartsQuery.update({
              chartUnitDrafts: resp.result.value.chartUnitDrafts,
              chartSpaceNodes: resp.result.value.chartSpaceNodes
            });

            return true;
          } else if (
            resp.result?.type === 'Failure' &&
            resp.result.error.message === ErEnum.BACKEND_BRANCH_DOES_NOT_EXIST
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
