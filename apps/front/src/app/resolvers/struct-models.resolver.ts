import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { PATH_INFO, PATH_ORG, PATH_PROJECT } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import type { ToBackendGetModelsRequest } from '#common/zod/backend/routes/models/get-models/get-models-request';
import type { ToBackendGetModelsResponse } from '#common/zod/backend/routes/models/get-models/get-models-response';
import { checkNavOrgProjectRepoBranchEnv } from '../functions/check-nav-org-project-repo-branch-env';
import { MemberQuery } from '../queries/member.query';
import { ModelsQuery } from '../queries/models.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { StructQuery } from '../queries/struct.query';
import { UserQuery } from '../queries/user.query';
import { ApiService } from '../services/api.service';
import { MyDialogService } from '../services/my-dialog.service';

@Injectable({ providedIn: 'root' })
export class StructModelsResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private apiService: ApiService,
    private modelsQuery: ModelsQuery,
    private structQuery: StructQuery,
    private memberQuery: MemberQuery,
    private myDialogService: MyDialogService,
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

    let payload: ToBackendGetModelsRequest['input'] = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetModels',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetModelsResponse) => {
          if (resp?.type === 'Success') {
            this.memberQuery.update(resp.output.userMember);

            this.structQuery.update(resp.output.struct);
            this.navQuery.updatePart({
              needValidate: resp.output.needValidate
            });
            this.modelsQuery.update({ models: resp.output.models });

            return true;
          } else if (
            resp?.type === 'Failure' &&
            resp.error.code === ErEnum.BACKEND_BRANCH_DOES_NOT_EXIST
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
