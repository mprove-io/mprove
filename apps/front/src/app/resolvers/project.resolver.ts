import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { ApiService } from '../services/api.service';
import { MemberState, MemberStore } from '../stores/member.store';
import { NavState, NavStore } from '../stores/nav.store';
import { ProjectStore } from '../stores/project.store';

@Injectable({ providedIn: 'root' })
export class ProjectResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navStore: NavStore,
    private projectStore: ProjectStore,
    private memberStore: MemberStore,
    private apiService: ApiService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let payload: apiToBackend.ToBackendGetProjectRequestPayload = {
      projectId: route.params[common.PARAMETER_PROJECT_ID]
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetProject,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetProjectResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let project = resp.payload.project;

            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                projectId: project.projectId,
                projectName: project.name,
                projectDefaultBranch: project.defaultBranch,
                branchId: state.branchId || project.defaultBranch,
                isRepoProd: common.isDefined(state.branchId)
                  ? state.isRepoProd
                  : true,
                envId: common.PROJECT_ENV_PROD
              })
            );

            localStorage.setItem(
              constants.LOCAL_STORAGE_PROJECT_ID,
              project.projectId
            );

            this.memberStore.update(state =>
              Object.assign(resp.payload.userMember, <MemberState>{
                avatarSmall: state.avatarSmall
              })
            );
            this.projectStore.update(project);
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
