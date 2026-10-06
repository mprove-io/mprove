import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  PARAMETER_BRANCH_ID,
  PARAMETER_ENV_ID,
  PATH_INFO,
  PATH_ORG,
  PATH_PROJECT
} from '#common/constants/top';

import type { ToBackendGetRepoRequest } from '#common/types/backend/routes/repos/get-repo/get-repo-request';
import type { ToBackendGetRepoResponse } from '#common/types/backend/routes/repos/get-repo/get-repo-response';
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

    let branchId = route.params[PARAMETER_BRANCH_ID];
    let envId = route.params[PARAMETER_ENV_ID];

    let payload: ToBackendGetRepoRequest['input'] = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: branchId,
      envId: envId,
      isFetch: false
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetRepo',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetRepoResponse) => {
          if (resp.type === 'Success') {
            this.memberQuery.update(resp.output.userMember);

            this.uiQuery.updatePart({ ...resp.output.user.ui });

            this.structQuery.update(resp.output.struct);
            this.navQuery.updatePart({
              branchId: branchId,
              envId: envId,
              needValidate: resp.output.needValidate
            });
            this.repoQuery.update(resp.output.repo);

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
