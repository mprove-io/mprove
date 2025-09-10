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
  LAST_SELECTED_CHART_ID,
  LAST_SELECTED_MODEL_ID,
  PARAMETER_MODEL_ID,
  PATH_CHARTS_LIST,
  PATH_INFO,
  PATH_MODELS_LIST,
  PATH_ORG,
  PATH_PROJECT
} from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendGetModelRequestPayload,
  ToBackendGetModelResponse
} from '~common/interfaces/to-backend/models/to-backend-get-model';
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

    let parametersModelId = route.params[PARAMETER_MODEL_ID];

    let urlParts = routerStateSnapshot.url.split('/');

    if (parametersModelId === LAST_SELECTED_MODEL_ID) {
      let projectModelLinks = this.uiQuery.getValue().projectModelLinks;
      let models = this.modelsQuery.getValue().models;

      let pLink = projectModelLinks.find(
        link => link.projectId === nav.projectId
      );

      if (isDefined(pLink)) {
        let pModel = models.find(r => r.modelId === pLink.modelId);

        if (urlParts[14] === PATH_CHARTS_LIST) {
          this.navigateService.navigateToChartsList({
            modelId: pModel?.modelId
          });
        } else if (urlParts[14] === PATH_MODELS_LIST) {
          this.navigateService.navigateToModelsList({
            modelId: pModel?.modelId
          });
        } else if (isDefined(pModel)) {
          this.navigateService.navigateToChart({
            modelId: pModel.modelId,
            chartId: LAST_SELECTED_CHART_ID
          });
        } else {
          this.navigateService.navigateToModels();
        }

        return of(false);
      } else {
        this.navigateService.navigateToModels();

        return of(false);
      }
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
            this.modelQuery.update(resp.payload.model);

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
