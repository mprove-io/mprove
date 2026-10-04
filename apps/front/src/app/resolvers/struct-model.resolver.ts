import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import {
  PARAMETER_MODEL_ID,
  PATH_CHART,
  PATH_INFO,
  PATH_ORG,
  PATH_PROJECT
} from '#common/constants/top';

import type { ToBackendGetModelRequest } from '#common/types/backend/routes/models/get-model/get-model-request';
import type { ToBackendGetModelResponse } from '#common/types/backend/routes/models/get-model/get-model-response';
import { checkNavOrgProjectRepoBranchEnv } from '../functions/check-nav-org-project-repo-branch-env';
import { MemberQuery } from '../queries/member.query';
import { ModelQuery } from '../queries/model.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { StructQuery } from '../queries/struct.query';
import { UserQuery } from '../queries/user.query';
import { ApiService } from '../services/api.service';
import { NavigateService } from '../services/navigate.service';

@Injectable({ providedIn: 'root' })
export class StructModelResolver implements Resolve<Observable<boolean>> {
  constructor(
    private apiService: ApiService,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private modelQuery: ModelQuery,
    private structQuery: StructQuery,
    private memberQuery: MemberQuery,
    private navigateService: NavigateService,
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

    let isChartRoute = routerStateSnapshot.url
      .split('?')[0]
      .split('/')
      .includes(PATH_CHART);

    let parametersModelId = route.params[PARAMETER_MODEL_ID];

    let modelState = this.modelQuery.getValue();

    if (
      parametersModelId === modelState.modelId &&
      modelState.structId === this.structQuery.getValue().structId
    ) {
      if (modelState.hasAccess === false && isChartRoute === false) {
        this.navigateService.navigateToModels();

        return of(false);
      }

      return of(true);
    }

    let payload: ToBackendGetModelRequest['input'] = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      modelId: parametersModelId,
      getMalloy: false
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetModel',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetModelResponse) => {
          if (resp?.type === 'Success') {
            this.memberQuery.update(resp.output.userMember);

            this.structQuery.update(resp.output.struct);
            this.navQuery.updatePart({
              needValidate: resp.output.needValidate
            });

            this.modelQuery.update(resp.output.model);

            if (resp.output.model.hasAccess === true || isChartRoute === true) {
              return true;
            } else {
              this.navigateService.navigateToModels();

              return false;
            }
          } else if (
            resp?.type === 'Failure' &&
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
