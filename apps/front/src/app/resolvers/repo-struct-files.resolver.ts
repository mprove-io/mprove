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
import { ErEnum } from '#common/enums/er.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetRepoRequestPayload,
  ToBackendGetRepoResponse
} from '#common/interfaces/to-backend/repos/to-backend-get-repo';
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

    let payload: ToBackendGetRepoRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: branchId,
      envId: envId,
      isFetch: false
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetRepo,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetRepoResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);

            this.uiQuery.updatePart({ ...resp.payload.user.ui });

            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              branchId: branchId,
              envId: envId,
              needValidate: resp.payload.needValidate
            });
            this.repoQuery.update(resp.payload.repo);

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
