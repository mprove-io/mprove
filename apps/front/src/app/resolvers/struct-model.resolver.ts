import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { checkNavOrgProjectRepoBranchEnv } from '../functions/check-nav-org-project-repo-branch-env';
import { MemberQuery } from '../queries/member.query';
import { ModelQuery } from '../queries/model.query';
import { ModelsQuery } from '../queries/models.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
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
    private modelsQuery: ModelsQuery,
    private structQuery: StructQuery,
    private memberQuery: MemberQuery,
    private uiQuery: UiQuery,
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

    let parametersModelId = route.params[common.PARAMETER_MODEL_ID];

    if (parametersModelId === common.LAST_SELECTED_MODEL_ID) {
      let projectModelLinks = this.uiQuery.getValue().projectModelLinks;
      let models = this.modelsQuery.getValue().models;

      let pLink = projectModelLinks.find(
        link => link.projectId === nav.projectId
      );

      if (common.isDefined(pLink)) {
        let pModel = models.find(r => r.modelId === pLink.modelId);

        if (common.isDefined(pModel)) {
          this.navigateService.navigateToChart({
            modelId: pModel.modelId,
            chartId: common.EMPTY_CHART_ID
          });
        } else {
          this.navigateService.navigateToCharts();
        }

        return of(false);
      } else {
        this.navigateService.navigateToCharts();

        return of(false);
      }
    }

    let payload: apiToBackend.ToBackendGetModelRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId,
      modelId: parametersModelId
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModel,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetModelResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);

            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });
            this.modelQuery.update(resp.payload.model);

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
              common.PATH_INFO
            ]);

            return false;
          } else {
            return false;
          }
        })
      );
  }
}
