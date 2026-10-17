import { Injectable } from '@angular/core';
import {
  type ActivatedRouteSnapshot,
  type Resolve,
  Router
} from '@angular/router';
import { type Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { PATH_INFO, PATH_ORG, PATH_PROJECT } from '#common/constants/top';
import type { ToBackendGetReportsOutput } from '#common/types/backend/routes/reports/get-reports/get-reports-output';
import { checkNavOrgProjectRepoBranchEnv } from '../functions/check-nav-org-project-repo-branch-env';
import { MemberQuery } from '../queries/member.query';
import { ModelsQuery } from '../queries/models.query';
import { NavQuery, type NavState } from '../queries/nav.query';
import { ReportsQuery } from '../queries/reports.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
import { UserQuery } from '../queries/user.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class StructReportsResolver implements Resolve<Observable<boolean>> {
  constructor(
    private router: Router,
    private uiQuery: UiQuery,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private apiService: ApiService,
    private reportsQuery: ReportsQuery,
    private modelsQuery: ModelsQuery,
    private structQuery: StructQuery,
    private memberQuery: MemberQuery
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    let nav: NavState;

    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    let userId: string;

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

    let loadDiff: number = Date.now() - this.uiQuery.getValue().metricsLoadedTs;

    if (loadDiff < 100) {
      return of(true);
    }

    nav = this.navQuery.getValue();

    let response: Observable<boolean> = this.apiService
      .req({
        route: 'api/ToBackendGetReports',
        payload: {
          projectId: nav.projectId,
          repoId: nav.repoId,
          branchId: nav.branchId,
          envId: nav.envId
        }
      })
      .pipe(
        map(resp => {
          if (resp.type === 'Success') {
            let output: ToBackendGetReportsOutput = resp.output;

            this.memberQuery.update(output.userMember);

            this.structQuery.update(output.struct);

            this.navQuery.updatePart({
              needValidate: output.needValidate
            });

            this.reportsQuery.update({
              reportUnitDrafts: output.reportUnitDrafts,
              reportSpaceNodes: output.reportSpaceNodes
            });

            this.modelsQuery.update({ models: output.storeModels });

            this.uiQuery.updatePart({ metricsLoadedTs: Date.now() });

            return true;
          }

          if (
            resp.type === 'Failure' &&
            resp.error.code === 'BACKEND_BRANCH_DOES_NOT_EXIST'
          ) {
            void this.router.navigate([
              PATH_ORG,
              nav.orgId,
              PATH_PROJECT,
              nav.projectId,
              PATH_INFO
            ]);
          }

          return false;
        })
      );

    return response;
  }
}
