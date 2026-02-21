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
  PATH_INFO,
  PATH_ORG,
  PATH_PROJECT
} from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetModelRequestPayload,
  ToBackendGetModelResponse
} from '#common/interfaces/to-backend/models/to-backend-get-model';
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

    let parametersModelId = route.params[PARAMETER_MODEL_ID];

    let modelState = this.modelQuery.getValue();

    if (
      parametersModelId === modelState.modelId &&
      modelState.structId === this.structQuery.getValue().structId
    ) {
      return of(true);
    }

    let payload: ToBackendGetModelRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      modelId: parametersModelId
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetModel,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetModelResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);

            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            if (resp.payload.model.hasAccess === true) {
              this.modelQuery.update(resp.payload.model);
              return true;
            } else {
              this.navigateService.navigateToModels();

              return false;
            }
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
